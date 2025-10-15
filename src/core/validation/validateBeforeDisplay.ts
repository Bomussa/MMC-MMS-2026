import path from 'node:path'
import constants from '../../../config/constants.json' with { type: 'json' }
import { readJSON } from '../../utils/fs-atomic.js'
import { localDateKeyAsiaQatar } from '../../utils/time.js'

type QueueEntry = {
  ticket: number
  visitId: string
  issuedAt: string
}

type QueueInEntry = {
  ticket: number
  visitId: string
  calledAt: string
}

type QueueFile = {
  waiting: QueueEntry[]
  in: QueueInEntry[]
  done: Array<{ ticket: number; visitId: string; doneAt: string }>
  meta: { clinicId: string; dateKey: string; version: number }
}

const LATE_MINUTES = Number(constants.PIN_LATE_MINUTES ?? 5)

export async function validateBeforeDisplayTicket(
  clinicId: string,
  visitId: string,
  ticket: number,
  issuedAtISO: string,
): Promise<{ status: 'OK' | 'INVALID' | 'LATE'; reason?: string }> {
  const dateKey = localDateKeyAsiaQatar()
  const queuePath = path.join('data', 'queues', clinicId, `${dateKey}.json`)
  const queue = await readJSON<QueueFile>(queuePath, null as any)
  if (!queue) {
    return { status: 'INVALID', reason: 'QUEUE_NOT_FOUND' }
  }

  const inActive = [...queue.waiting, ...queue.in]
  const exists = inActive.some((entry: QueueEntry | QueueInEntry) => entry.ticket === ticket && entry.visitId === visitId)
  if (!exists) {
    return { status: 'INVALID', reason: 'TICKET_NOT_IN_ACTIVE' }
  }

  const issuedAt = new Date(issuedAtISO).getTime()
  const lateThreshold = LATE_MINUTES * 60 * 1000
  if (!Number.isFinite(issuedAt)) {
    return { status: 'INVALID', reason: 'INVALID_TIMESTAMP' }
  }
  if (Date.now() - issuedAt > lateThreshold) {
    return { status: 'LATE' }
  }

  return { status: 'OK' }
}
