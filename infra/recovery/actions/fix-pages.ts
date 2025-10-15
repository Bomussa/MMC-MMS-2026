import type { RecoveryEnv } from '../types';

export async function fixPages(env: RecoveryEnv) {
  await env.MMS_CACHE.put('fix:pages', Date.now().toString());
  return true;
}
