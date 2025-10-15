import type { RecoveryEnv } from '../types';

export async function rescheduleCron(env: RecoveryEnv) {
  await env.MMS_CACHE.put('cron:last_success', new Date().toISOString());
  return true;
}
