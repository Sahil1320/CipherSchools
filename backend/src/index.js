import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { getMongoClient } from './db/mongo.js'
import { getPostgresClient } from './db/postgres.js'

import { assignmentsRouter } from './routes/assignments.js'
import { queriesRouter } from './routes/queries.js'
import { hintsRouter } from './routes/hints.js'
import { ensureSeedAssignments } from './services/assignmentsService.js'

async function bootstrap() {
  await Promise.all([getMongoClient(), getPostgresClient()])
  await ensureSeedAssignments()

  const app = express()

  app.use(
    cors({
      origin: env.clientOrigin || '*'
    })
  )
  app.use(express.json())

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/assignments', assignmentsRouter)
  app.use('/api/queries', queriesRouter)
  app.use('/api/hints', hintsRouter)

  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err)
    res
      .status(err.status || 500)
      .json({ message: err.message || 'Internal server error' })
  })

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on port ${env.port}`)
  })
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err)
  process.exit(1)
})

