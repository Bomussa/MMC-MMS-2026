// Seed & Time Warp - Create test data with LATE scenarios
// This script creates queue entries older than 5 minutes to test LATE validation

import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = 'data'
const LATE_MINUTES = 10 // Create entries 10 minutes old (>5min threshold)

interface QueueEntry {
  ticket: number
  visitId: string
  issuedAt: string
}

interface QueueInEntry {
  ticket: number
  visitId: string
  calledAt: string
}

interface QueueFile {
  meta: { clinicId: string; dateKey: string; version: number }
  nextCallTicket: number
  waiting: QueueEntry[]
  in: QueueInEntry[]
  done: Array<{ ticket: number; visitId: string; doneAt: string }>
}

interface PinStore {
  meta: { tz: string; version: number }
  pins: Record<string, string[]>
}

function getDateKey(): string {
  // Asia/Qatar timezone
  const now = new Date()
  const qatarOffset = 3 * 60 // UTC+3
  const localTime = new Date(now.getTime() + qatarOffset * 60 * 1000)
  
  // Check if before 05:00 (use previous day)
  const hours = localTime.getUTCHours()
  if (hours < 5) {
    localTime.setUTCDate(localTime.getUTCDate() - 1)
  }
  
  const year = localTime.getUTCFullYear()
  const month = String(localTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(localTime.getUTCDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

function getOldTimestamp(minutesAgo: number): string {
  const now = new Date()
  const old = new Date(now.getTime() - minutesAgo * 60 * 1000)
  return old.toISOString()
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true })
}

function writeJSON(filePath: string, data: any): void {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function seedPins(): void {
  console.log('📌 Seeding PINs...')
  
  const dateKey = getDateKey()
  const pinFile = path.join(DATA_DIR, 'pins', `${dateKey}.json`)
  
  const pinStore: PinStore = {
    meta: { tz: 'Asia/Qatar', version: 1 },
    pins: {
      [`clinic1:${dateKey}`]: ['01', '02', '03', '04', '05'],
      [`clinic2:${dateKey}`]: ['01', '02', '03'],
      [`xray:${dateKey}`]: ['01', '02'],
      [`lab:${dateKey}`]: ['01', '02', '03', '04'],
    },
  }
  
  writeJSON(pinFile, pinStore)
  console.log(`  ✅ Created: ${pinFile}`)
}

function seedQueues(): void {
  console.log('🎫 Seeding Queues (with LATE entries)...')
  
  const dateKey = getDateKey()
  const clinics = ['clinic1', 'clinic2', 'xray', 'lab']
  
  clinics.forEach((clinicId, index) => {
    const queueFile = path.join(DATA_DIR, 'queues', clinicId, `${dateKey}.json`)
    
    // Create OLD tickets (>5min) and RECENT tickets (<5min)
    const oldTimestamp = getOldTimestamp(LATE_MINUTES)
    const recentTimestamp = getOldTimestamp(2) // 2 minutes ago
    
    const queue: QueueFile = {
      meta: { clinicId, dateKey, version: 1 },
      nextCallTicket: 5,
      waiting: [
        { ticket: 5, visitId: `visit-${clinicId}-5`, issuedAt: recentTimestamp },
        { ticket: 6, visitId: `visit-${clinicId}-6`, issuedAt: recentTimestamp },
      ],
      in: [
        { ticket: 4, visitId: `visit-${clinicId}-4`, calledAt: recentTimestamp },
      ],
      done: [
        { ticket: 1, visitId: `visit-${clinicId}-1`, doneAt: oldTimestamp },
        { ticket: 2, visitId: `visit-${clinicId}-2-LATE`, doneAt: oldTimestamp },
        { ticket: 3, visitId: `visit-${clinicId}-3`, doneAt: getOldTimestamp(3) },
      ],
    }
    
    // Add one LATE ticket in waiting (for testing)
    if (index === 0) {
      queue.waiting.push({
        ticket: 7,
        visitId: `visit-${clinicId}-7-LATE-TEST`,
        issuedAt: oldTimestamp,
      })
    }
    
    writeJSON(queueFile, queue)
    console.log(`  ✅ Created: ${queueFile}`)
  })
}

function seedRoutes(): void {
  console.log('🛣️  Seeding Routes...')
  
  const dateKey = getDateKey()
  const routesDir = path.join(DATA_DIR, 'routes')
  
  // Sample route with multiple steps
  const sampleRoute = {
    visitId: 'visit-sample-route',
    examType: 'رجال/عام',
    gender: 'M',
    route: [
      {
        clinicId: 'clinic1',
        assigned: { ticket: 5, dateKey, issuedAt: getOldTimestamp(2) },
        status: 'OK',
        assignedAt: getOldTimestamp(2),
      },
      {
        clinicId: 'xray',
        assigned: null,
      },
      {
        clinicId: 'lab',
        assigned: null,
      },
    ],
    createdAt: getOldTimestamp(10),
  }
  
  writeJSON(path.join(routesDir, 'visit-sample-route.json'), sampleRoute)
  
  // LATE route for testing
  const lateRoute = {
    visitId: 'visit-late-route',
    examType: 'نساء/عام',
    gender: 'F',
    route: [
      {
        clinicId: 'clinic2',
        assigned: { ticket: 2, dateKey, issuedAt: getOldTimestamp(LATE_MINUTES) },
        status: 'LATE',
        assignedAt: getOldTimestamp(LATE_MINUTES),
      },
    ],
    createdAt: getOldTimestamp(LATE_MINUTES + 5),
  }
  
  writeJSON(path.join(routesDir, 'visit-late-route.json'), lateRoute)
  
  console.log(`  ✅ Created: ${routesDir}/visit-sample-route.json`)
  console.log(`  ✅ Created: ${routesDir}/visit-late-route.json`)
}

function seedAudit(): void {
  console.log('📝 Seeding Audit Log...')
  
  const auditDir = path.join(DATA_DIR, 'audit')
  const dateKey = getDateKey()
  const auditFile = path.join(auditDir, `${dateKey}.log`)
  
  const entries = [
    `[${getOldTimestamp(20)}] seed.started`,
    `[${getOldTimestamp(15)}] pin.issued clinic=clinic1 pin=01`,
    `[${getOldTimestamp(10)}] queue.assigned clinic=clinic1 ticket=1`,
    `[${getOldTimestamp(5)}] route.assigned visit=visit-sample-route`,
  ]
  
  ensureDir(auditDir)
  fs.writeFileSync(auditFile, entries.join('\n') + '\n')
  console.log(`  ✅ Created: ${auditFile}`)
}

function main(): void {
  console.log('')
  console.log('═══════════════════════════════════════')
  console.log('  SEED & TIME WARP')
  console.log('═══════════════════════════════════════')
  console.log(`Date Key: ${getDateKey()}`)
  console.log(`Late Threshold: ${LATE_MINUTES} minutes`)
  console.log('')
  
  try {
    seedPins()
    seedQueues()
    seedRoutes()
    seedAudit()
    
    console.log('')
    console.log('═══════════════════════════════════════')
    console.log('  ✅ SEEDING COMPLETED')
    console.log('═══════════════════════════════════════')
    console.log('')
    console.log('Test data created with:')
    console.log('  • Recent tickets (<5min) - Should show as OK')
    console.log('  • Late tickets (>5min) - Should show as LATE')
    console.log('  • Multiple clinics: clinic1, clinic2, xray, lab')
    console.log('  • Sample routes with multi-step journeys')
    console.log('')
    
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

main()
