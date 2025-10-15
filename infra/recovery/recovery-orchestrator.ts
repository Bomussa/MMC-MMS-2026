import type { RecoveryEnv, HealthProbe } from './types';
import { fixWorker } from './actions/fix-worker';
import { fixPages } from './actions/fix-pages';
import { fixD1 } from './actions/fix-d1';
import { warmupKV } from './actions/warmup-kv';
import { restoreFromR2 } from './actions/restore-from-r2';
import { rescheduleCron } from './actions/reschedule-cron';
import { rotateSecrets } from './actions/rotate-secrets';
import { runHealthProbes } from './health/probes';
import { appendLog } from './actions/write-log';

export interface RecoveryOutcome {
  status: number;
  body: { ok: boolean; msg?: string; fixed?: string[]; probes: HealthProbe[] };
}

export async function runRecovery(_request: Request | null, env: RecoveryEnv): Promise<RecoveryOutcome> {
  const probes: HealthProbe[] = await runHealthProbes(env, { skipWorkerProbe: true });
  const failed = probes.filter(p => !p.ok).map(p => p.name);

  if (failed.length === 0) {
    await appendLog(env, failed, probes);
    return { status: 200, body: { ok: true, msg: 'All systems healthy', probes } };
  }

  if (env.FAIL_COUNT && Number(env.FAIL_COUNT) >= 3) {
    await env.MMS_CACHE.put('system:mode', 'safe');
  }

  for (const target of failed) {
    switch (target) {
      case 'worker':
        await fixWorker(env);
        break;
      case 'pages':
        await fixPages(env);
        break;
      case 'd1':
        await fixD1(env);
        break;
      case 'kv':
        await warmupKV(env);
        break;
      case 'r2':
        await restoreFromR2(env);
        break;
      case 'cron':
        await rescheduleCron(env);
        break;
      case 'secrets':
        await rotateSecrets(env);
        break;
      default:
        break;
    }
  }

  const recheck = await runHealthProbes(env, { skipWorkerProbe: true });
  await appendLog(env, failed, recheck);
  return { status: 200, body: { ok: true, fixed: failed, probes: recheck } };
}
