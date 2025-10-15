import express, { type Request, type Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import constants from '../config/constants.json' with { type: 'json' }
import clinics from '../config/clinics.json' with { type: 'json' }
import { pinRouter } from './api/routes/pin.js'
import { queueRouter } from './api/routes/queue.js'
import { routeRouter } from './api/routes/route.js'
import { eventsRouter } from './api/routes/events.js'
import { verifySystemHealth } from './core/monitor/health-check.js'
import { clinicCallSchedulerTick, queueIntervalSeconds } from './core/queueManager.js'

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/api/pin', pinRouter)
app.use('/api/queue', queueRouter)
app.use('/api/route', routeRouter)
app.use('/api/events', eventsRouter)

app.get('/api/health', async (_req: Request, res: Response) => {
  const health = await verifySystemHealth()
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    status: health.status,
    settingsSummary: {
      QUEUE_INTERVAL_SECONDS: constants.QUEUE_INTERVAL_SECONDS,
      PIN_LATE_MINUTES: constants.PIN_LATE_MINUTES,
      MOBILE_QR_ONLY: constants.MOBILE_QR_ONLY,
      DESKTOP_BASIC_AUTH: constants.DESKTOP_BASIC_AUTH,
    },
  })
})

const clinicIds = Object.keys(clinics)
setInterval(() => {
  clinicIds.forEach((clinicId) => {
    clinicCallSchedulerTick(String(clinicId)).catch(() => {
      /* ignore tick errors */
    })
  })
}, Math.max(1, queueIntervalSeconds()) * 1000)

const PORT = Number(process.env.PORT ?? 3000)
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MMS listening on :${PORT}`)
})
