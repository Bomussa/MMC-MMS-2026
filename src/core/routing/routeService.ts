import path from 'node:path'
import routeDefinitionsRaw from '../../../config/routeMap.json' with { type: 'json' }
import { writeAtomicJSON, readJSON } from '../../utils/fs-atomic.js'
import { localDateKeyAsiaQatar, nowISO } from '../../utils/time.js'
import { appendAudit } from '../../utils/logger.js'

type Gender = 'M' | 'F'

type RouteDefinition = Record<string, string[] | { prefix?: string; M?: string[]; F?: string[] }>

type RouteStep = {
  clinicId: string
  assigned?: {
    ticket: number
    dateKey: string
    issuedAt: string
  }
  status?: 'OK' | 'LATE' | 'INVALID'
  assignedAt?: string
}

type RouteFile = {
  visitId: string
  examType: string
  gender?: Gender
  route: RouteStep[]
  createdAt: string
}

function routeFilePath(visitId: string): string {
  return path.join('data', 'routes', `${visitId}.json`)
}

const routeDefinitions = routeDefinitionsRaw as RouteDefinition

function resolveSteps(examType: string, gender?: Gender): string[] {
  const direct = routeDefinitions[examType]
  if (Array.isArray(direct)) {
    return direct.map(String)
  }
  const womenRoute = routeDefinitions['نساء/عام']
  if (!Array.isArray(womenRoute)) {
    if (gender === 'F' && Array.isArray(womenRoute?.F)) {
      return womenRoute.F.map(String)
    }
    if (Array.isArray(womenRoute?.M)) {
      return womenRoute.M.map(String)
    }
  }
  return []
}

export async function createRoute(visitId: string, examType: string, gender?: Gender): Promise<RouteFile> {
  const steps = resolveSteps(examType, gender)
  const route: RouteFile = {
    visitId,
    examType,
    gender,
    route: steps.map((clinicId) => ({ clinicId })),
    createdAt: nowISO(),
  }

  await writeAtomicJSON(routeFilePath(visitId), route)
  await appendAudit(`route.assigned visit=${visitId} exam=${examType} steps=${steps.join(',')}`)
  return route
}

export async function assignFirstClinicTicket(
  visitId: string,
  assignFn: (clinicId: string) => Promise<{ ticket: number; dateKey: string }>,
): Promise<RouteFile> {
  const route = await readJSON<RouteFile>(routeFilePath(visitId), null as any)
  if (!route) {
    throw new Error('ROUTE_NOT_FOUND')
  }
  const first = route.route[0]
  if (!first) {
    throw new Error('EMPTY_ROUTE')
  }
  if (!first.assigned) {
    const assignment = await assignFn(first.clinicId)
    first.assigned = { ...assignment, issuedAt: nowISO() }
    first.assignedAt = nowISO()
    await writeAtomicJSON(routeFilePath(visitId), route)
  }
  return route
}

export async function completeStepAndAssignNext(
  visitId: string,
  currentClinicId: string,
  nextAssign: (clinicId: string) => Promise<{ ticket: number; dateKey: string }>,
): Promise<RouteFile> {
  const route = await readJSON<RouteFile>(routeFilePath(visitId), null as any)
  if (!route) {
    throw new Error('ROUTE_NOT_FOUND')
  }
  const index = route.route.findIndex((step: RouteStep) => step.clinicId === currentClinicId)
  if (index < 0) {
    throw new Error('CLINIC_NOT_IN_ROUTE')
  }

  const next = route.route[index + 1]
  if (next && !next.assigned) {
    const assignment = await nextAssign(next.clinicId)
    next.assigned = { ...assignment, issuedAt: nowISO() }
    next.assignedAt = nowISO()
    await appendAudit(`route.unlocked visit=${visitId} next=${next.clinicId} ticket=${assignment.ticket}`)
  }

  await writeAtomicJSON(routeFilePath(visitId), route)
  return route
}
