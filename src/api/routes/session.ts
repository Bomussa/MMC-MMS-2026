/**
 * Session Routes - مسارات API للجلسات وQR Code
 */

import express from 'express'
import {
  createSession,
  validateSession,
  useSession,
  updateDeviceInfo,
  getSessionStats
} from '../../core/sessionService.js'

const router = express.Router()

/**
 * POST /api/session/create
 * إنشاء جلسة جديدة لمريض
 */
router.post('/create', (req, res) => {
  try {
    const { patientId } = req.body
    
    if (!patientId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'MISSING_PATIENT_ID' 
      })
    }
    
    const userAgent = req.headers['user-agent']
    const ipAddress = req.ip || req.connection.remoteAddress
    
    const { token, session } = createSession(patientId, userAgent, ipAddress)
    
    res.json({
      ok: true,
      token,
      session: {
        patientId: session.patientId,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      }
    })
  } catch (error) {
    console.error('❌ خطأ في إنشاء الجلسة:', error)
    res.status(500).json({ 
      ok: false, 
      error: 'SERVER_ERROR' 
    })
  }
})

/**
 * POST /api/session/validate
 * التحقق من صلاحية token
 */
router.post('/validate', (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({ 
        ok: false, 
        error: 'MISSING_TOKEN' 
      })
    }
    
    const validation = validateSession(token)
    
    if (!validation.valid) {
      return res.status(401).json({ 
        ok: false, 
        error: validation.error 
      })
    }
    
    res.json({
      ok: true,
      session: {
        patientId: validation.session!.patientId,
        createdAt: validation.session!.createdAt,
        expiresAt: validation.session!.expiresAt,
        device: validation.session!.device
      }
    })
  } catch (error) {
    console.error('❌ خطأ في التحقق من الجلسة:', error)
    res.status(500).json({ 
      ok: false, 
      error: 'SERVER_ERROR' 
    })
  }
})

/**
 * POST /api/session/use
 * استخدام الجلسة (تفعيلها)
 */
router.post('/use', (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({ 
        ok: false, 
        error: 'MISSING_TOKEN' 
      })
    }
    
    const result = useSession(token)
    
    if (!result.success) {
      return res.status(401).json({ 
        ok: false, 
        error: result.error 
      })
    }
    
    res.json({
      ok: true,
      session: {
        patientId: result.session!.patientId,
        usedAt: result.session!.usedAt
      }
    })
  } catch (error) {
    console.error('❌ خطأ في استخدام الجلسة:', error)
    res.status(500).json({ 
      ok: false, 
      error: 'SERVER_ERROR' 
    })
  }
})

/**
 * POST /api/session/device
 * تحديث معلومات الجهاز للجلسة
 */
router.post('/device', (req, res) => {
  try {
    const { token, device } = req.body
    
    if (!token || !device) {
      return res.status(400).json({ 
        ok: false, 
        error: 'MISSING_PARAMS' 
      })
    }
    
    if (!['iOS', 'Android', 'Desktop'].includes(device)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'INVALID_DEVICE_TYPE' 
      })
    }
    
    const userAgent = req.headers['user-agent']
    const result = updateDeviceInfo(token, device, userAgent)
    
    if (!result.success) {
      return res.status(404).json({ 
        ok: false, 
        error: result.error 
      })
    }
    
    res.json({ ok: true })
  } catch (error) {
    console.error('❌ خطأ في تحديث معلومات الجهاز:', error)
    res.status(500).json({ 
      ok: false, 
      error: 'SERVER_ERROR' 
    })
  }
})

/**
 * GET /api/session/stats
 * الحصول على إحصائيات الجلسات
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getSessionStats()
    res.json({ ok: true, stats })
  } catch (error) {
    console.error('❌ خطأ في الحصول على الإحصائيات:', error)
    res.status(500).json({ 
      ok: false, 
      error: 'SERVER_ERROR' 
    })
  }
})

export default router
