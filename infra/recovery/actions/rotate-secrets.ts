import type { RecoveryEnv } from '../types';

export async function rotateSecrets(env: RecoveryEnv) {
  await env.MMS_CACHE.put('rotate:secrets', new Date().toISOString());
  return true;
}
