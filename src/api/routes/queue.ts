import { Router, type Request, type Response } from 'express'
import { assignTicket, markDone } from '../../core/queueManager.js'
import { validateBeforeDisplayTicket } from '../../core/validation/validateBeforeDisplay.js'
import { pushClientNotice } from '../../core/notifications/notificationService.js'

export const queueRouter = Router()

queueRouter.post('/enter', async (req: Request, res: Response) => {
  try {
    const { clinicId, visitId } = req.body ?? {}
    if (!clinicId || !visitId) {
      return res.status(400).json({ ok: false, error: 'clinicId, visitId required' })
    }

    const assigned = await assignTicket(String(clinicId), String(visitId))
    const check = await validateBeforeDisplayTicket(
      String(clinicId),
      String(visitId),
      assigned.ticket,
      new Date().toISOString(),
    )
    if (check.status !== 'OK') {
      return res.status(409).json({ ok: false, error: 'INVALID_TICKET', check })
    }

    await pushClientNotice({
      type: 'START_HINT',
      visitId: String(visitId),
      clinicId: String(clinicId),
      ttl: 30,
      at: new Date().toISOString(),
    })
    res.json({ ok: true, ...assigned, status: check.status })
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message ?? 'queue_enter_failed' })
  }
})

queueRouter.get('/status/:clinicId', async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params
    if (!clinicId) {
      return res.status(400).json({ ok: false, error: 'clinicId required' })
    }

    // Read current queue for today
    const { localDateKeyAsiaQatar } = await import('../../utils/time.js')
    const { readJSON } = await import('../../utils/fs-atomic.js')
    const path = await import('node:path')
    
    const dateKey = localDateKeyAsiaQatar()
    const queueFile = path.default.join('data', 'queues', clinicId, `${dateKey}.json`)
    
    interface QueueFile {
      meta: { clinicId: string; dateKey: string; version: number }
      nextCallTicket: number
      waiting: Array<{ ticket: number; visitId: string; issuedAt: string }>
      in: Array<{ ticket: number; visitId: string; calledAt: string }>
      done: Array<{ ticket: number; visitId: string; doneAt: string }>
    }
    
    const queue = await readJSON<QueueFile>(queueFile, null as any)
    
    if (!queue) {
      return res.json({
        ok: true,
        clinicId,
        dateKey,
        waiting: [],
        in: [],
        done: [],
        nextCallTicket: 0,
      })
    }
    
    res.json({
      ok: true,
      clinicId,
      dateKey,
      waiting: queue.waiting,
      in: queue.in,
      done: queue.done,
      nextCallTicket: queue.nextCallTicket,
      stats: {
        totalWaiting: queue.waiting.length,
        totalIn: queue.in.length,
        totalDone: queue.done.length,
        totalToday: queue.waiting.length + queue.in.length + queue.done.length,
      },
    })
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message ?? 'queue_status_failed' })
  }
})

queueRouter.post('/complete', async (req: Request, res: Response) => {
  try {
    const { clinicId, visitId, ticket } = req.body ?? {}
    if (!clinicId || !visitId || !ticket) {
      return res.status(400).json({ ok: false, error: 'clinicId, visitId, ticket required' })
    }

    await markDone(String(clinicId), String(visitId), Number(ticket))
    res.json({ ok: true })
  } catch (error: any) {
    res.status(400).json({ ok: false, error: error?.message ?? 'queue_complete_failed' })
  }
})
