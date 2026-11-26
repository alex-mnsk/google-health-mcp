import { AuthorizationError, CimdFetchError, authorizationErrorRedirect } from '@cloudflare/workers-oauth-provider';
import { createHash, randomBytes } from 'node:crypto';
import { healthReadScopes } from '../googleHealth/catalog.js';
import { writeMetrics } from '../googleHealth/writeCatalog.js';
import { readJson } from '../googleHealth/client.js';
import { googleToken } from './google-oauth.js';
import { isOwner, type CloudEnv, type OwnerProps } from './types.js';

const escape = (value: string) => value.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);
const callbackUrl = (env: CloudEnv) => `${env.PUBLIC_ORIGIN}/google/callback`;
const disclosure = '<p>Плагин получает разрешённые вами данные Google Health. Данные Samsung Health и Galaxy Watch доступны после синхронизации через Health Connect.</p><p>Запрошенные данные и команды записи передаются через Cloudflare между Google и вашим чатом OpenAI. Архив измерений в отдельной базе приложения не сохраняется. Для повторных запросов сохраняются зашифрованные токены доступа Google; доступ можно отозвать в аккаунте Google и отключить в ChatGPT.</p>';
const writeScopes = [...new Set(writeMetrics.map(metric => metric.scope)),
  'https://www.googleapis.com/auth/googlehealth.profile.writeonly',
  'https://www.googleapis.com/auth/googlehealth.settings.writeonly'];
const page = (body: string, status = 200) => new Response(`<!doctype html><html lang="ru"><meta charset="utf-8"><title>Private Google Health</title>${body}</html>`, {
  status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store',
    'content-security-policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'" }
});

export const signInHandler = {
  async fetch(request: Request, env: CloudEnv): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/privacy')) return page(`<h1>Private Google Health</h1>${disclosure}<p>Личный плагин только для владельца. Чтение и отдельно разрешаемые создание, изменение и удаление поддерживаемых записей. Подключение начинается из ChatGPT.</p>`);
    if (url.pathname !== '/authorize' && url.pathname !== '/google/callback') return new Response('Not found', { status: 404 });
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.OWNER_GOOGLE_EMAIL) return page('<h1>Подключение ещё не настроено</h1><p>Владелец должен настроить Google OAuth Client в этом отдельном приложении.</p>', 503);
    const oauth = env.OAUTH_PROVIDER;
    try {
      if (url.pathname === '/authorize' && request.method === 'GET') {
        const authRequest = await oauth.parseAuthRequest(request);
        const details = await oauth.describeConsent(authRequest);
        const consent = await oauth.beginConsent(authRequest);
        consent.headers.set('content-type', 'text/html; charset=utf-8');
        consent.headers.set('content-security-policy', "default-src 'none'; form-action 'self' https://accounts.google.com https://chatgpt.com; frame-ancestors 'none'; base-uri 'none'");
        consent.headers.set('referrer-policy', 'same-origin');
        return new Response(`<!doctype html><html lang="ru"><meta charset="utf-8"><title>Доступ к Google Health</title>
<h1>${details.scope.includes('health:write') ? 'Разрешить чтение и изменение данных здоровья?' : 'Разрешить чтение данных здоровья?'}</h1>
<p>Приложение: <strong>${escape(details.clientName)}</strong>.</p>
<p>${details.clientDomain ? `Домен: ${escape(details.clientDomain)}.` : 'Название приложения не подтверждено.'}</p>
<p>Доступ будет передан на: <strong>${escape(details.redirectHost)}</strong>.</p>
${details.redirectIsLoopback ? '<p>Это локальное приложение. Продолжайте, только если вы сами начали подключение.</p>' : ''}
${disclosure}<p>Войти сможет только Google-аккаунт владельца.</p>
<p>${details.scope.includes('health:write') ? 'Разрешения: чтение, создание, изменение и удаление поддерживаемых записей Google Health; изменение поддерживаемых полей профиля и единиц измерения. Категории записи: вес, рост, процент жира, сон, тренировки, вода, питание, настроение, симптомы и записи о цикле. Вы можете отказать отдельным категориям на экране Google. Изменение/удаление ограничено записями нашего OAuth-приложения. Обратная синхронизация в Samsung Health не гарантируется.' : 'Разрешения: только чтение здоровья, активности, профиля и настроек Google Health.'}</p>
<form method="post" action="/authorize"><input type="hidden" name="handle" value="${escape(consent.handle)}">
<button name="decision" value="approve">Продолжить через Google</button>
<button name="decision" value="deny">Отмена</button></form></html>`, { headers: consent.headers });
      }
      if (url.pathname === '/authorize' && request.method === 'POST') {
        if (request.headers.get('origin') !== env.PUBLIC_ORIGIN) return new Response('Access denied', { status: 403 });
        const form = await request.formData();
        const handle = String(form.get('handle') ?? '');
        if (form.get('decision') !== 'approve') {
          const denied = await oauth.denyConsent(request, handle);
          return new Response(null, { status: 302, headers: denied.headers });
        }
        const approved = await oauth.approveConsent(request, handle);
        const verifier = randomBytes(32).toString('base64url');
        const transaction = await oauth.beginUpstream(approved.request, { data: { verifier }, headers: approved.headers });
        const google = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        google.search = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: callbackUrl(env),
          response_type: 'code', state: transaction.state, scope: ['openid', 'email', ...healthReadScopes, ...(env.ENABLE_WRITES === 'true' && approved.request.scope.includes('health:write') ? writeScopes : [])].join(' '),
          code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256',
          access_type: 'offline', prompt: 'consent', login_hint: env.OWNER_GOOGLE_EMAIL
        }).toString();
        transaction.headers.set('location', google.toString());
        return new Response(null, { status: 302, headers: transaction.headers });
      }
      if (url.pathname === '/google/callback' && request.method === 'GET') {
        const transaction = await oauth.finishUpstream<{ verifier: string }>(request);
        const fail = () => {
          transaction.headers.set('location', authorizationErrorRedirect(transaction.request, 'access_denied'));
          return new Response(null, { status: 302, headers: transaction.headers });
        };
        const code = url.searchParams.get('code');
        if (!code || url.searchParams.has('error')) return fail();
        const token = await googleToken({ grant_type: 'authorization_code', code,
          redirect_uri: callbackUrl(env), code_verifier: transaction.data.verifier }, env);
        // Verify identity at Google's authenticated endpoint; never trust decoded, unsigned ID tokens.
        const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          redirect: 'manual', headers: { authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000)
        });
        const user = await readJson(userResponse);
        if (!userResponse.ok || user.email_verified !== true || typeof user.email !== 'string' || typeof user.sub !== 'string' ||
            user.email.toLowerCase() !== env.OWNER_GOOGLE_EMAIL.toLowerCase() || (env.OWNER_GOOGLE_SUB && user.sub !== env.OWNER_GOOGLE_SUB)) return fail();
        const scopes = token.scope?.split(' ') ?? [];
        if (!token.refresh_token || !healthReadScopes.some(scope => scopes.includes(scope))) return page('<h1>Нужны разрешения</h1><p>Начните подключение заново из ChatGPT и разрешите хотя бы одну категорию данных здоровья и фоновый доступ.</p>', 400);
        const identityResponse = await fetch('https://health.googleapis.com/v4/users/me/identity', {
          redirect: 'manual', headers: { authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000)
        });
        if (!identityResponse.ok) {
          const failure = await readJson(identityResponse);
          const error = failure.error;
          const details = error && typeof error === 'object' && 'details' in error && Array.isArray(error.details) ? error.details : [];
          const reasons = details.flatMap(detail => detail && typeof detail === 'object' && 'reason' in detail && typeof detail.reason === 'string' ? [detail.reason] : []);
          // Show only known reason codes; upstream messages can contain private data.
          const reason = reasons.includes('ACCOUNT_NOT_LINKED') ? 'ACCOUNT_NOT_LINKED'
            : reasons.includes('SERVICE_DISABLED') ? 'SERVICE_DISABLED'
            : reasons.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') ? 'ACCESS_TOKEN_SCOPE_INSUFFICIENT' : null;
          const guidance = reason === 'ACCOUNT_NOT_LINKED'
            ? 'Аккаунт Google ещё не связан с профилем Google Health. Откройте Google Health (бывший Fitbit) на телефоне, войдите под тем же аккаунтом и завершите создание профиля. Затем начните подключение из ChatGPT заново.'
            : reason === 'SERVICE_DISABLED' ? 'Включите Google Health API в проекте OAuth-клиента, затем начните подключение заново из ChatGPT.'
            : 'Проверьте профиль Google Health на телефоне и настройки доступа Google Cloud, затем начните подключение заново из ChatGPT.';
          return page(`<h1>Google Health недоступен</h1><p>${guidance}</p><p>Диагностика: HTTP ${identityResponse.status}${reason ? `, ${reason}` : ''}.</p>`, 400);
        }
        const identity = await readJson(identityResponse);
        if (typeof identity.healthUserId !== 'string' || !identity.healthUserId) return fail();
        const props: OwnerProps = { googleSub: user.sub, email: user.email.toLowerCase(), refreshToken: token.refresh_token,
          accessToken: token.access_token, expiresAt: Date.now() + token.expires_in * 1000, healthUserId: identity.healthUserId, scopes };
        if (!isOwner(props, env)) return fail();
        const grant = await oauth.completeAuthorization({ request: transaction.request, userId: user.sub,
          metadata: {}, scope: transaction.request.scope, props });
        transaction.headers.set('location', grant.redirectTo);
        return new Response(null, { status: 302, headers: transaction.headers });
      }
      return new Response('Method not allowed', { status: 405 });
    } catch (error) {
      if (error instanceof AuthorizationError || error instanceof CimdFetchError) return page('<p>Вход недействителен или устарел. Начните подключение заново из ChatGPT.</p>', 400);
      return page('<p>Вход временно недоступен. Проверьте настройки Google OAuth и начните подключение заново из ChatGPT.</p>', 502);
    }
  }
};
