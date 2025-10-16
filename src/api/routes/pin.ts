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

pinRouter.get('/current/:clinicId', async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params
    if (!clinicId) {
      return res.status(400).json({ ok: false, error: 'clinicId required' })
    }

    // Read current PIN store for today
    const { localDateKeyAsiaQatar } = await import('../../utils/time.js')
    const { readJSON } = await import('../../utils/fs-atomic.js')
    const path = await import('node:path')
    
    const dateKey = localDateKeyAsiaQatar()
    const pinFile = path.default.join('data', 'pins', `${dateKey}.json`)
    
    interface PinStore {
      meta: { tz: string; version: number }
      pins: Record<string, string[]>
    }
    
    const store = await readJSON<PinStore>(pinFile, { meta: { tz: 'Asia/Qatar', version: 1 }, pins: {} })
    
    const key = `${clinicId}:${dateKey}`
    const pins = store.pins[key] || []
    const currentPin = pins.length > 0 ? pins[pins.length - 1] : null
    
    res.json({ ok: true, clinicId, dateKey, currentPin, totalIssued: pins.length, allPins: pins })
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message ?? 'pin_current_failed' })
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
