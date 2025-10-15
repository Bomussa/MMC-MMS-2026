import { Router, type Request, type Response } from 'express'
import { onNotice } from '../../core/notifications/notificationService.js'

export const eventsRouter = Router()

eventsRouter.get('/', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })
  res.write(`event: hello\ndata: ${JSON.stringify({ ok: true, ts: Date.now() })}\n\n`)

  const unsubscribe = onNotice((notice) => {
    res.write(`event: notice\ndata: ${JSON.stringify(notice)}\n\n`)
  })

  req.on('close', () => {
    unsubscribe()
  })
})
