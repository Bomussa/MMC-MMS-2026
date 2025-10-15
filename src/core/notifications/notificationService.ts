import constants from '../../../config/constants.json' with { type: 'json' }
import { appendAudit } from '../../utils/logger.js'

export type NoticeType = 'START_HINT' | 'NEAR_TURN' | 'YOUR_TURN' | 'STEP_DONE_NEXT'

export interface Notice {
  type: NoticeType
  visitId: string
  clinicId?: string
  ahead?: number
  ttl: number
  at: string
}

type Listener = (notice: Notice) => void

const listeners = new Set<Listener>()

export function onNotice(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function pushClientNotice(notice: Notice): Promise<void> {
  for (const listener of listeners) {
    listener(notice)
  }
  await appendAudit(`notice.sent type=${notice.type} visit=${notice.visitId} clinic=${notice.clinicId ?? ''} ttl=${notice.ttl}`)
}

export function mapQueueEventsToNotices(evt: { type?: string; ahead?: number; visitId?: string; clinicId?: string }): void {
  if (!evt || !evt.type || !evt.visitId) {
    return
  }
  const ttl = Number(constants.NOTICE_TTL_SECONDS ?? 30)
  if (evt.type === 'queue.near' && Number(evt.ahead) === Number(constants.NOTIFY_NEAR_AHEAD ?? 3)) {
    void pushClientNotice({
      type: 'NEAR_TURN',
      visitId: String(evt.visitId),
      clinicId: evt.clinicId,
      ahead: evt.ahead,
      ttl,
      at: new Date().toISOString(),
    })
  }
  if (evt.type === 'queue.updated' && Number(evt.ahead) === 0) {
    void pushClientNotice({
      type: 'YOUR_TURN',
      visitId: String(evt.visitId),
      clinicId: evt.clinicId,
      ttl,
      at: new Date().toISOString(),
    })
  }
}
