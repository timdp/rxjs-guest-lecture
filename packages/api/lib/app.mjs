import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { join } from 'path'
import { lookup } from './lookup.mjs'
import { noCache } from './no-cache.mjs'
import { root } from './paths.mjs'
import { slow } from './slow.mjs'
import { PORT, API_LATENCY } from './config.mjs'

const app = express()

app.set('etag', false)

app.use(morgan('dev'))

app.use(cors())

app.get('/lookup', slow(API_LATENCY), noCache(), (req, res) => {
  const { query } = req.query
  if (typeof query !== 'string') {
    res.sendStatus(400)
    return
  }
  const queryNorm = query.trim().toLowerCase()
  if (queryNorm === '') {
    res.sendStatus(400)
    return
  }
  if (queryNorm === 'oops') {
    res.sendStatus(418)
    return
  }
  const results = lookup(queryNorm)
  res.send({ results })
})

const nmPath = join(root, 'node_modules')
app.use('/node_modules/', express.static(nmPath))

const server = app.listen(PORT, () => {
  console.log('Server started:', server.address())
})
