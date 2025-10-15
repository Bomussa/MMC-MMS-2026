import type { RecoveryEnv } from '../types';

export async function restoreFromR2(env: RecoveryEnv) {
  const list = await env.R2_BACKUPS.list({ prefix: 'backups/', limit: 1, include: ['customMetadata'] });
  const latest = list.objects?.[0];
  if (!latest) return false;
  await env.MMS_CACHE.put('last_restore', latest.key);
  return true;
}
