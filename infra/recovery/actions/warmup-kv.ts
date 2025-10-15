import type { RecoveryEnv } from '../types';

export async function warmupKV(env: RecoveryEnv) {
  await env.MMS_CACHE.put('settings:theme', 'default');
  await env.MMS_CACHE.put('heartbeat', new Date().toISOString());
  return true;
}
