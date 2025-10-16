/**
 * Session Service - إدارة جلسات QR Code
 * يتعامل مع إنشاء، التحقق، وتتبع الجلسات
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const SESSIONS_FILE = path.resolve(process.cwd(), 'data', 'sessions.json')
const SESSION_EXPIRY_MS = 15 * 60 * 1000 // 15 دقيقة

interface QrSession {
  tokenHash: string
  patientId: string
  createdAt: string
  expiresAt: string
  usedAt?: string
  device?: 'iOS' | 'Android' | 'Desktop'
  userAgent?: string
  ipAddress?: string
  isValid: boolean
}

/**
 * تحميل الجلسات من الملف
 */
export function loadSessions(): QrSession[] {
  try {
    const dataDir = path.dirname(SESSIONS_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf8')
      return []
    }
    
    const data = fs.readFileSync(SESSIONS_FILE, 'utf8')
    return JSON.parse(data) || []
  } catch (error) {
    console.error('❌ خطأ في تحميل الجلسات:', error)
    return []
  }
}

/**
 * حفظ الجلسات في الملف
 */
export function saveSessions(sessions: QrSession[]): void {
  try {
    const dataDir = path.dirname(SESSIONS_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8')
  } catch (error) {
    console.error('❌ خطأ في حفظ الجلسات:', error)
    throw error
  }
}

/**
 * إنشاء جلسة جديدة
 */
export function createSession(patientId: string, userAgent?: string, ipAddress?: string): { token: string; session: QrSession } {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_MS)
  
  const session: QrSession = {
    tokenHash,
    patientId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    userAgent,
    ipAddress,
    isValid: true
  }
  
  const sessions = loadSessions()
  sessions.push(session)
  saveSessions(sessions)
  
  console.log(`✅ تم إنشاء جلسة جديدة للمريض: ${patientId}`)
  
  return { token, session }
}

/**
 * التحقق من صلاحية الجلسة
 */
export function validateSession(token: string): { valid: boolean; session?: QrSession; error?: string } {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const sessions = loadSessions()
  
  const session = sessions.find(s => s.tokenHash === tokenHash)
  
  if (!session) {
    return { valid: false, error: 'SESSION_NOT_FOUND' }
  }
  
  if (!session.isValid) {
    return { valid: false, error: 'SESSION_ALREADY_USED' }
  }
  
  const now = new Date()
  const expiresAt = new Date(session.expiresAt)
  
  if (now > expiresAt) {
    return { valid: false, error: 'SESSION_EXPIRED' }
  }
  
  return { valid: true, session }
}

/**
 * استخدام الجلسة (تفعيلها)
 */
export function useSession(token: string): { success: boolean; session?: QrSession; error?: string } {
  const validation = validateSession(token)
  
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }
  
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const sessions = loadSessions()
  
  const sessionIndex = sessions.findIndex(s => s.tokenHash === tokenHash)
  if (sessionIndex === -1) {
    return { success: false, error: 'SESSION_NOT_FOUND' }
  }
  
  sessions[sessionIndex].usedAt = new Date().toISOString()
  sessions[sessionIndex].isValid = false
  
  saveSessions(sessions)
  
  console.log(`✅ تم استخدام الجلسة للمريض: ${sessions[sessionIndex].patientId}`)
  
  return { success: true, session: sessions[sessionIndex] }
}

/**
 * تحديث معلومات الجهاز في الجلسة
 */
export function updateDeviceInfo(
  token: string, 
  device: 'iOS' | 'Android' | 'Desktop',
  userAgent?: string
): { success: boolean; error?: string } {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const sessions = loadSessions()
  
  const sessionIndex = sessions.findIndex(s => s.tokenHash === tokenHash)
  
  if (sessionIndex === -1) {
    return { success: false, error: 'SESSION_NOT_FOUND' }
  }
  
  sessions[sessionIndex].device = device
  if (userAgent) {
    sessions[sessionIndex].userAgent = userAgent
  }
  
  saveSessions(sessions)
  
  console.log(`✅ تم تحديث جهاز الجلسة: ${device}`)
  
  return { success: true }
}

/**
 * حذف الجلسات المنتهية (تنظيف)
 */
export function cleanupExpiredSessions(): number {
  const sessions = loadSessions()
  const now = new Date()
  
  const validSessions = sessions.filter(s => {
    const expiresAt = new Date(s.expiresAt)
    return now <= expiresAt
  })
  
  const removedCount = sessions.length - validSessions.length
  
  if (removedCount > 0) {
    saveSessions(validSessions)
    console.log(`🧹 تم حذف ${removedCount} جلسة منتهية`)
  }
  
  return removedCount
}

/**
 * الحصول على إحصائيات الجلسات
 */
export function getSessionStats(): {
  total: number
  active: number
  used: number
  expired: number
  byDevice: { iOS: number; Android: number; Desktop: number }
} {
  const sessions = loadSessions()
  const now = new Date()
  
  const stats = {
    total: sessions.length,
    active: 0,
    used: 0,
    expired: 0,
    byDevice: { iOS: 0, Android: 0, Desktop: 0 }
  }
  
  sessions.forEach(s => {
    const expiresAt = new Date(s.expiresAt)
    
    if (s.usedAt) {
      stats.used++
    } else if (now > expiresAt) {
      stats.expired++
    } else {
      stats.active++
    }
    
    if (s.device) {
      stats.byDevice[s.device]++
    }
  })
  
  return stats
}

// تنظيف دوري للجلسات المنتهية (كل 10 دقائق)
setInterval(() => {
  cleanupExpiredSessions()
}, 10 * 60 * 1000)
