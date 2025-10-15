import path from 'node:path'
import constants from '../../config/constants.json' with { type: 'json' }
import { writeAtomicJSON, readJSON } from '../utils/fs-atomic.js'
import { localDateKeyAsiaQatar } from '../utils/time.js'
import { appendAudit } from '../utils/logger.js'

interface PinStore {
  meta: { tz: string; version: number }
  pins: Record<string, string[]>
}

const PIN_DIR = path.join('data', 'pins')
const DEFAULT_RANGE = constants.PIN_RANGE_PER_CLINIC as [string, string]
const PIN_DIGITS = Number(constants.PIN_DIGITS ?? 2)

function storePath(dateKey: string): string {
  return path.join(PIN_DIR, `${dateKey}.json`)
}

export async function issueNextPin(clinicId: string, dateKey?: string): Promise<{ pin: string; dateKey: string }> {
  const day = dateKey || localDateKeyAsiaQatar()
  const file = storePath(day)
  const store = await readJSON<PinStore>(file, { meta: { tz: constants.TIMEZONE, version: 1 }, pins: {} })
  const key = `${clinicId}:${day}`
  const sequence = store.pins[key] || []
  const [minStr, maxStr] = DEFAULT_RANGE
  const min = Number.parseInt(minStr, 10)
  const max = Number.parseInt(maxStr, 10)
  let next = sequence.length ? Number.parseInt(sequence[sequence.length - 1], 10) + 1 : min

  if (!Number.isFinite(next) || next > max) {
    throw new Error('PIN_RANGE_EXHAUSTED')
  }

  const pin = String(next).padStart(PIN_DIGITS, '0')
  store.pins[key] = [...sequence, pin]
  await writeAtomicJSON(file, store)
  await appendAudit(`pin.issued clinic=${clinicId} dateKey=${day} pin=${pin}`)
  return { pin, dateKey: day }
}

export async function verifyPinOrThrow(clinicId: string, dateKey: string, pin: string): Promise<boolean> {
  const file = storePath(dateKey)
  const store = await readJSON<PinStore>(file, { meta: { tz: constants.TIMEZONE, version: 1 }, pins: {} })
  const key = `${clinicId}:${dateKey}`
  const allowed = store.pins[key] || []
  if (!allowed.includes(pin)) {
    throw new Error('INVALID_PIN')
  }
  return true
}
