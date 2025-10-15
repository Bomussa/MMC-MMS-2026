import constants from '../../config/constants.json' with { type: 'json' }

const tz = (constants.TIMEZONE as string) || 'Asia/Qatar'
const defaultPivot = (constants.SERVICE_DAY_PIVOT as string) || '05:00'

export { tz }

export function nowISO(date: Date = new Date()): string {
  return date.toISOString()
}

export function secondsDiff(a: Date | string, b: Date | string): number {
  const d1 = typeof a === 'string' ? new Date(a) : a
  const d2 = typeof b === 'string' ? new Date(b) : b
  return Math.floor((d1.getTime() - d2.getTime()) / 1000)
}

export function localDateKeyAsiaQatar(date: Date = new Date(), pivot: string = defaultPivot): string {
  const formatter = buildFormatter()
  const parts = formatParts(formatter, date)
  let year = Number(parts.year)
  let month = Number(parts.month)
  let day = Number(parts.day)
  const hour = Number(parts.hour)
  const minute = Number(parts.minute)
  const [rawHour, rawMinute] = pivot.split(':').map(Number)
  const pivotHour = Number.isFinite(rawHour) ? rawHour : 5
  const pivotMinute = Number.isFinite(rawMinute) ? rawMinute : 0
  const beforePivot = hour < pivotHour || (hour === pivotHour && minute < pivotMinute)

  if (beforePivot) {
    const previous = new Date(date)
    previous.setUTCDate(previous.getUTCDate() - 1)
    const prevParts = formatParts(formatter, previous)
    year = Number(prevParts.year)
    month = Number(prevParts.month)
    day = Number(prevParts.day)
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function buildFormatter(): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
  } catch {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
  }
}

function formatParts(formatter: Intl.DateTimeFormat, date: Date): Record<string, string> {
  return Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]))
}
