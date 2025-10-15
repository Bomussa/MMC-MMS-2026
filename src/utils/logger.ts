import { promises as fs } from 'node:fs'
import path from 'node:path'

const AUDIT_ROOT = path.join('data', 'audit')

export function log(...args: unknown[]): void {
  // eslint-disable-next-line no-console
  console.log('[MMS]', ...args)
}

export async function appendAudit(line: string): Promise<void>
export async function appendAudit(baseDir: string, event: string, payload?: Record<string, unknown>): Promise<void>
export async function appendAudit(first: string, second?: string, payload: Record<string, unknown> = {}): Promise<void> {
  if (second === undefined) {
    await writeLine(first)
    return
  }

  const record = JSON.stringify({ event: second, ts: new Date().toISOString(), ...payload })
  await writeLine(record, first)
}

async function writeLine(line: string, baseDir?: string): Promise<void> {
  const dir = baseDir ? path.join(baseDir, 'audit') : AUDIT_ROOT
  const file = path.join(dir, `${new Date().toISOString().slice(0, 10)}.log`)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.appendFile(file, `${line}\n`, 'utf8')
}
