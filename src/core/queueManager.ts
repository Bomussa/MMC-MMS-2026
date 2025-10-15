import path from 'node:path'
import constants from '../../config/constants.json' with { type: 'json' }
import { writeAtomicJSON, readJSON } from '../utils/fs-atomic.js'
import { localDateKeyAsiaQatar, nowISO } from '../utils/time.js'
import { appendAudit } from '../utils/logger.js'

interface QueueEntry {
  ticket: number
  visitId: string
  issuedAt: string
}

interface QueueInEntry {
  ticket: number
  visitId: string
  calledAt: string
}

interface QueueDoneEntry {
  ticket: number
  visitId: string
  doneAt: string
}

interface QueueFile {
  meta: { clinicId: string; dateKey: string; version: number }
  nextCallTicket: number
  waiting: QueueEntry[]
  in: QueueInEntry[]
  done: QueueDoneEntry[]
}

function filePath(clinicId: string, dateKey: string): string {
  return path.join('data', 'queues', clinicId, `${dateKey}.json`)
}

export async function assignTicket(
  clinicId: string,
  visitId: string,
  issuedAt?: string,
): Promise<{ ticket: number; clinicId: string; dateKey: string }> {
  const day = localDateKeyAsiaQatar()
  const file = filePath(clinicId, day)
  const queue = await readJSON<QueueFile>(file, {
    meta: { clinicId, dateKey: day, version: 1 },
    nextCallTicket: 0,
    waiting: [],
    in: [],
    done: [],
  })

  const ticket = queue.waiting.length + queue.in.length + queue.done.length + 1
  queue.waiting.push({ ticket, visitId, issuedAt: issuedAt || nowISO() })
  await writeAtomicJSON(file, queue)
  await appendAudit(`queue.assigned clinic=${clinicId} visit=${visitId} ticket=${ticket}`)
  return { ticket, clinicId, dateKey: day }
}

export async function markDone(clinicId: string, visitId: string, ticket: number): Promise<{ ok: true }> {
  const day = localDateKeyAsiaQatar()
  const file = filePath(clinicId, day)
  const queue = await readJSON<QueueFile>(file, {
    meta: { clinicId, dateKey: day, version: 1 },
    nextCallTicket: 0,
    waiting: [],
    in: [],
    done: [],
  })

  const activeIndex = queue.in.findIndex((entry: QueueInEntry) => entry.ticket === ticket && entry.visitId === visitId)
  if (activeIndex >= 0) {
    const [entry] = queue.in.splice(activeIndex, 1)
    queue.done.push({ ticket: entry.ticket, visitId: entry.visitId, doneAt: nowISO() })
  } else {
  const waitingIndex = queue.waiting.findIndex((entry: QueueEntry) => entry.ticket === ticket && entry.visitId === visitId)
    if (waitingIndex < 0) {
      throw new Error('TICKET_NOT_FOUND')
    }
    const [entry] = queue.waiting.splice(waitingIndex, 1)
    queue.done.push({ ticket: entry.ticket, visitId: entry.visitId, doneAt: nowISO() })
  }

  await writeAtomicJSON(file, queue)
  await appendAudit(`queue.completed clinic=${clinicId} visit=${visitId} ticket=${ticket}`)
  return { ok: true }
}

export async function clinicCallSchedulerTick(clinicId: string): Promise<void> {
  const day = localDateKeyAsiaQatar()
  const file = filePath(clinicId, day)
  const queue = await readJSON<QueueFile>(file, {
    meta: { clinicId, dateKey: day, version: 1 },
    nextCallTicket: 0,
    waiting: [],
    in: [],
    done: [],
  })

  if (queue.waiting.length > 0) {
    const entry = queue.waiting.shift()!
    queue.in.push({ ticket: entry.ticket, visitId: entry.visitId, calledAt: nowISO() })
    queue.nextCallTicket = entry.ticket + 1
    await appendAudit(`clinic.call clinic=${clinicId} ticket=${entry.ticket}`)
  }

  await writeAtomicJSON(file, queue)
}

export function queueIntervalSeconds(): number {
  return Number(constants.QUEUE_INTERVAL_SECONDS ?? 120)
}
