// Official API v4 identifiers and filter fields, verified 2026-10-26:
// https://developers.google.com/health/data-types
// https://developers.google.com/health/filters
const activity = 'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly';
const metrics = 'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly';
const sleep = 'https://www.googleapis.com/auth/googlehealth.sleep.readonly';
type Metric = { scope: string; field: string; dailyRollup: boolean; session?: boolean; raw?: boolean; reconciled?: boolean };

export const healthMetrics = {
  steps: { scope: activity, field: 'interval.civil_start_time', dailyRollup: true },
  distance: { scope: activity, field: 'interval.civil_start_time', dailyRollup: true },
  floors: { scope: activity, field: 'interval.civil_start_time', dailyRollup: true, raw: false },
  'active-energy-burned': { scope: activity, field: 'interval.civil_start_time', dailyRollup: true },
  'total-calories': { scope: activity, field: 'interval.civil_start_time', dailyRollup: true, raw: false, reconciled: false },
  exercise: { scope: activity, field: 'interval.civil_start_time', dailyRollup: false, session: true },
  'vo2-max': { scope: activity, field: 'sample_time.civil_time', dailyRollup: false },
  'heart-rate': { scope: metrics, field: 'sample_time.civil_time', dailyRollup: true },
  'daily-resting-heart-rate': { scope: metrics, field: 'date', dailyRollup: false },
  'heart-rate-variability': { scope: metrics, field: 'sample_time.civil_time', dailyRollup: false },
  'daily-heart-rate-variability': { scope: metrics, field: 'date', dailyRollup: false },
  'oxygen-saturation': { scope: metrics, field: 'sample_time.civil_time', dailyRollup: false },
  'daily-oxygen-saturation': { scope: metrics, field: 'date', dailyRollup: false },
  'daily-respiratory-rate': { scope: metrics, field: 'date', dailyRollup: false },
  weight: { scope: metrics, field: 'sample_time.civil_time', dailyRollup: true },
  'body-fat': { scope: metrics, field: 'sample_time.civil_time', dailyRollup: true },
  height: { scope: metrics, field: 'sample_time.civil_time', dailyRollup: false },
  'blood-glucose': { scope: metrics, field: 'sample_time.civil_time', dailyRollup: true },
  'core-body-temperature': { scope: metrics, field: 'sample_time.civil_time', dailyRollup: true },
  sleep: { scope: sleep, field: 'interval.civil_end_time', dailyRollup: false, session: true }
} satisfies Record<string, Metric>;

export type HealthMetric = keyof typeof healthMetrics;
export const healthMetricNames = Object.keys(healthMetrics) as [HealthMetric, ...HealthMetric[]];
export const healthReadScopes = [activity, metrics, sleep,
  'https://www.googleapis.com/auth/googlehealth.profile.readonly',
  'https://www.googleapis.com/auth/googlehealth.settings.readonly'];
