import type { RecoveryEnv } from '../types';
import { runRecovery } from '../recovery-orchestrator';
import { warmupKV } from '../actions/warmup-kv';

export async function runDrill(env: RecoveryEnv) {
  const sequence = ['worker', 'pages', 'd1', 'kv', 'r2', 'cron'];
  for (const target of sequence) {
    await env.MMS_CACHE.put(`drill:${target}:simulate_fail`, '1');
    await runRecovery(null, env);
  }
  await warmupKV(env);
  return true;
}
