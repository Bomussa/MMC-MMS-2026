import type { RecoveryEnv, HealthProbe } from '../types';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

export async function runHealthProbes(env: RecoveryEnv, options: { skipWorkerProbe?: boolean } = {}): Promise<HealthProbe[]> {
  const results: HealthProbe[] = [];

  // Worker/API probe
  if (!options.skipWorkerProbe) {
    results.push(await probeFetch((env.SITE_ORIGIN ?? '').replace(/\/$/, '') + '/api/health', 'worker'));
  }

  // D1 probe
  results.push(await probeD1(env));

  // KV probe
  try {
    await env.MMS_CACHE.put('heartbeat', new Date().toISOString());
    results.push({ name: 'kv', ok: true });
  }
  catch {
    results.push({ name: 'kv', ok: false });
  }

  // R2 probe
  try {
    const list = await env.R2_BACKUPS.list({ prefix: 'backups/', limit: 1, order: 'desc' });
    const ok = Array.isArray(list.objects) && list.objects.length > 0;
    results.push({ name: 'r2', ok });
  }
  catch {
    results.push({ name: 'r2', ok: false });
  }

  // Cron probe via KV heartbeat
  try {
    const lastCron = await env.MMS_CACHE.get('cron:last_success');
    results.push({ name: 'cron', ok: !!lastCron });
  }
  catch {
    results.push({ name: 'cron', ok: false });
  }

  return results;
}

export async function healthCheck(_request: Request, env: RecoveryEnv) {
  const probes = await runHealthProbes(env, { skipWorkerProbe: true });
  const ok = probes.every(p => p.ok);
  return jsonResponse({ ok, probes });
}

async function probeFetch(url: string, name: string): Promise<HealthProbe> {
  if (!url || url.startsWith('undefined')) {
    return { name, ok: false };
  }
  try {
    const res = await fetch(url, { method: 'GET' });
    return { name, ok: res.ok };
  }
  catch {
    return { name, ok: false };
  }
}

async function probeD1(env: RecoveryEnv): Promise<HealthProbe> {
  try {
    await env.DB.prepare('SELECT 1').first();
    return { name: 'd1', ok: true };
  }
  catch {
    return { name: 'd1', ok: false };
  }
}
