# Google Health MCP bridge

Run a single-user MCP server for your own Google Health account. Each deployment uses its own Cloudflare resources, OAuth app, and credentials. ChatGPT connects to the HTTPS MCP endpoint using OAuth. The example configuration disables writes. An operator can opt in with `ENABLE_WRITES=true` and reconnect to grant the required write scope.

## Cloudflare setup

1. Install Node.js 22 or newer and run `npm ci`.
2. Authenticate Wrangler with your own Cloudflare account. Copy `wrangler.example.jsonc` to `wrangler.jsonc`. Set your Worker name and the exact HTTPS `PUBLIC_ORIGIN` without a trailing slash.
3. Run `npx wrangler kv namespace create OAUTH_KV` and paste the new ID in `wrangler.jsonc`. Use a separate namespace for each deployment. It holds OAuth state and grants, so restrict access to it.
4. Run `npm run cloud:deploy`. Set the secrets below via Cloudflare's dashboard or `npx wrangler secret put SECRET_NAME`, which prompts for the value. The service rejects account access until the owner and credentials are configured.

## Google Health authorization

1. Enable Google Health API in your own Google Cloud project and configure its OAuth consent screen according to [Google's setup guide](https://developers.google.com/health/setup).
2. Create a Web application OAuth client with redirect URI `<your-origin>/google/callback`. Configure the read scopes in `src/cloud/google-oauth.ts` and add your own account to test users when applicable.
3. Set Worker Secrets `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `OWNER_GOOGLE_EMAIL`. Optionally pin the Google account's stable subject with `OWNER_GOOGLE_SUB`.
4. Google refresh tokens can expire sooner while an external OAuth application is in Testing. Follow Google's publishing and verification requirements for your project. Reconnect if Google revokes the grant.

## Connect ChatGPT

Add a custom MCP server with URL `<your-origin>/mcp`. Complete OAuth using the same owner account you configured. Only the configured account may approve access. Confirm that an unauthenticated request to `/mcp` cannot access any tools, then connect as the owner and test a read operation.

Store deployment values in ignored local configuration and secret values in Worker Secrets. Keep local credentials and token files accessible only to your user. Rotate credentials at their issuer if exposed.

## Development

Run `npm run check`. Example configuration uses placeholder infrastructure and no production credentials.
