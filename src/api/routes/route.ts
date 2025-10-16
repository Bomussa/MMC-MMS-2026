import path from 'node:path'
import { Router, type Request, type Response } from 'express'
import { createRoute, assignFirstClinicTicket, completeStepAndAssignNext } from '../../core/routing/routeService.js'
import { assignTicket } from '../../core/queueManager.js'
import { validateBeforeDisplayTicket } from '../../core/validation/validateBeforeDisplay.js'
import { readJSON } from '../../utils/fs-atomic.js'

export const routeRouter = Router()

routeRouter.post('/assign', async (req: Request, res: Response) => {
  try {
    const { visitId, examType, gender } = req.body ?? {}
    if (!visitId || !examType) {
      return res.status(400).json({ ok: false, error: 'visitId and examType required' })
    }

    const routeFile = await createRoute(
      String(visitId),
      String(examType),
      gender ? (String(gender) as 'M' | 'F') : undefined,
    )
    const withFirst = await assignFirstClinicTicket(
      String(visitId),
      (clinicId: string) => assignTicket(String(clinicId), String(visitId)),
    )
    const firstStep = withFirst.route[0]
    if (firstStep?.assigned) {
      const check = await validateBeforeDisplayTicket(
        String(firstStep.clinicId),
        String(visitId),
        firstStep.assigned.ticket,
        firstStep.assigned.issuedAt,
      )
      if (check.status !== 'OK') {
        return res.status(409).json({ ok: false, error: 'INVALID_TICKET', check, route: withFirst })
      }
    }

    res.json({ ok: true, route: withFirst })
  } catch (error: any) {
    res.status(400).json({ ok: false, error: error?.message ?? 'route_assign_failed' })
  }
})

routeRouter.post('/next', async (req: Request, res: Response) => {
  try {
    const { visitId, currentClinicId } = req.body ?? {}
    if (!visitId || !currentClinicId) {
      return res.status(400).json({ ok: false, error: 'visitId and currentClinicId required' })
    }

    const updated = await completeStepAndAssignNext(
      String(visitId),
      String(currentClinicId),
      (clinicId: string) => assignTicket(String(clinicId), String(visitId)),
    )
    res.json({ ok: true, route: updated })
  } catch (error: any) {
    res.status(400).json({ ok: false, error: error?.message ?? 'route_next_failed' })
  }
})

routeRouter.get('/:visitId', async (req: Request, res: Response) => {
  const visitId = String(req.params.visitId)
  const filePath = path.join('data', 'routes', `${visitId}.json`)
  const routeFile = await readJSON(filePath, null as any)
  if (!routeFile) {
    return res.status(404).json({ ok: false, error: 'ROUTE_NOT_FOUND' })
  }

  // Apply ZFD validation to each step with assigned ticket
  const routeWithValidation = { ...routeFile }
  for (const step of routeWithValidation.route) {
    if (step.assigned) {
      const check = await validateBeforeDisplayTicket(
        String(step.clinicId),
        String(visitId),
        step.assigned.ticket,
        step.assigned.issuedAt,
      )
      step.status = check.status
      if (check.reason) {
        step.validationReason = check.reason
      }
    }
  }

  res.json({ ok: true, route: routeWithValidation })
})
