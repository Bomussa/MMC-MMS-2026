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
