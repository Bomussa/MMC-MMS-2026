import type { RecoveryEnv } from '../types';

export async function appendLog(env: RecoveryEnv, failed: string[], probes: Array<{ name: string; ok: boolean }>) {
  const existing = await env.MMS_CACHE.get('auto_recovery_log');
  const entry = `[${new Date().toISOString()}] Failed: ${failed.join(',') || 'none'} | Probes: ${JSON.stringify(probes)}\n`;
  const nextValue = (existing ?? '') + entry;
  await env.MMS_CACHE.put('auto_recovery_log', nextValue);
}
