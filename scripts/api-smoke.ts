// API Smoke Tests - MMS 2027
// Tests all critical API endpoints with real requests

import fs from 'node:fs'
import path from 'node:path'

type TestResult = {
  name: string
  endpoint: string
  method: string
  status: 'PASS' | 'FAIL'
  statusCode?: number
  duration: number
  error?: string
  response?: any
}

const results: TestResult[] = []
const API_BASE = process.env.API_ORIGIN || 'http://localhost:3000'

async function fetchAPI(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE}${endpoint}`
  const start = Date.now()
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })
    return res
  } finally {
    // Duration tracked in caller
  }
}

async function test(name: string, endpoint: string, method: string, body?: any): Promise<TestResult> {
  const start = Date.now()
  try {
    const res = await fetchAPI(endpoint, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    })
    
    const duration = Date.now() - start
    const responseData = await res.json().catch(() => null)
    
    const result: TestResult = {
      name,
      endpoint,
      method,
      status: res.ok ? 'PASS' : 'FAIL',
      statusCode: res.status,
      duration,
      response: responseData,
    }
    
    if (!res.ok) {
      result.error = `HTTP ${res.status}: ${res.statusText}`
    }
    
    results.push(result)
    console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${name} - ${duration}ms`)
    return result
    
  } catch (error: any) {
    const duration = Date.now() - start
    const result: TestResult = {
      name,
      endpoint,
      method,
      status: 'FAIL',
      duration,
      error: error.message,
    }
    results.push(result)
    console.log(`❌ ${name} - ${error.message}`)
    return result
  }
}

async function runAllTests(): Promise<void> {
  console.log('═══════════════════════════════════════')
  console.log('  API SMOKE TESTS - MMS 2027')
  console.log('═══════════════════════════════════════')
  console.log(`API Base: ${API_BASE}`)
  console.log('')
  
  // Test 1: Health Check
  await test('Health Check', '/api/health', 'GET')
  
  // Test 2: Issue PIN
  const pinResult = await test('Issue PIN', '/api/pin/issue', 'POST', {
    clinicId: 'clinic1',
  })
  
  let issuedPin = ''
  if (pinResult.status === 'PASS' && pinResult.response?.pin) {
    issuedPin = pinResult.response.pin
  }
  
  // Test 3: Validate PIN (if we got one)
  if (issuedPin) {
    await test('Validate PIN (Valid)', '/api/pin/validate', 'POST', {
      clinicId: 'clinic1',
      pin: issuedPin,
    })
    
    await test('Validate PIN (Invalid)', '/api/pin/validate', 'POST', {
      clinicId: 'clinic1',
      pin: '99',
    })
  }
  
  // Test 4: Queue Enter
  const visitId = `test-visit-${Date.now()}`
  const queueResult = await test('Queue Enter', '/api/queue/enter', 'POST', {
    clinicId: 'clinic1',
    visitId,
  })
  
  let ticket = 0
  if (queueResult.status === 'PASS' && queueResult.response?.ticket) {
    ticket = queueResult.response.ticket
  }
  
  // Test 5: Route Assign
  const routeResult = await test('Route Assign', '/api/route/assign', 'POST', {
    visitId,
    examType: 'رجال/عام',
    gender: 'M',
  })
  
  // Test 6: Route Get
  if (routeResult.status === 'PASS') {
    await test('Route Get', `/api/route/${visitId}`, 'GET')
  }
  
  // Test 7: Route Next Step
  if (ticket > 0) {
    await test('Route Next Step', '/api/route/next', 'POST', {
      visitId,
      currentClinicId: 'clinic1',
    })
  }
  
  // Test 8: Queue Complete
  if (ticket > 0) {
    await test('Queue Complete', '/api/queue/complete', 'POST', {
      clinicId: 'clinic1',
      visitId,
      ticket,
    })
  }
  
  // Summary
  console.log('')
  console.log('═══════════════════════════════════════')
  console.log('  SUMMARY')
  console.log('═══════════════════════════════════════')
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  
  console.log(`Total Tests: ${results.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⏱️  Total Duration: ${totalDuration}ms`)
  console.log('')
  
  // Save results
  const outputPath = path.join('logs', 'api-smoke.json')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    summary: {
      total: results.length,
      passed,
      failed,
      duration: totalDuration,
    },
    tests: results,
  }, null, 2))
  
  console.log(`📄 Results saved: ${outputPath}`)
  console.log('')
  
  // Exit with error if any failed
  if (failed > 0) {
    console.log('⚠️  Some tests failed!')
    process.exit(1)
  } else {
    console.log('✅ All tests passed!')
    process.exit(0)
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
