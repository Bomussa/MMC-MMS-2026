import { Router, type Request, type Response } from 'express'
import { issueNextPin, verifyPinOrThrow } from '../../core/pinService.js'
import { validateBeforeDisplayTicket } from '../../core/validation/validateBeforeDisplay.js'

export const pinRouter = Router()

pinRouter.post('/issue', async (req: Request, res: Response) => {
  try {
    const { clinicId, visitId } = req.body ?? {}
    if (!clinicId) {
      return res.status(400).json({ ok: false, error: 'clinicId required' })
    }

    const { pin, dateKey } = await issueNextPin(String(clinicId))
    if (visitId) {
      const check = await validateBeforeDisplayTicket(
        String(clinicId),
        String(visitId),
        Number(pin),
        new Date().toISOString(),
      )
      if (check.status !== 'OK') {
        return res.status(409).json({ ok: false, error: 'INVALID_TICKET', check })
      }
    }

    res.json({ ok: true, pin, dateKey })
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message ?? 'pin_issue_failed' })
  }
})

pinRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const { clinicId, dateKey, pin } = req.body ?? {}
    if (!clinicId || !dateKey || !pin) {
      return res.status(400).json({ ok: false, error: 'clinicId, dateKey, pin required' })
    }

    await verifyPinOrThrow(String(clinicId), String(dateKey), String(pin))
    res.json({ ok: true })
  } catch (error: any) {
    res.status(400).json({ ok: false, error: error?.message ?? 'pin_invalid' })
  }
})
