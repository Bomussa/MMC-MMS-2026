import type { RecoveryEnv } from '../types';

export async function fixD1(env: RecoveryEnv) {
  await env.MMS_CACHE.put('fix:d1', Date.now().toString());
  return true;
}
