import type { RecoveryEnv } from '../types';

export async function fixWorker(env: RecoveryEnv) {
  await env.MMS_CACHE.put('fix:worker', Date.now().toString());
  return true;
}
