import express from 'express'
import { generateHint, HintError } from '../services/hintsService.js'

export const hintsRouter = express.Router()

hintsRouter.post('/', async (req, res, next) => {
  try {
    const result = await generateHint(req.body)
    res.json(result)
  } catch (err) {
    if (err instanceof HintError) {
      return res.status(err.status || 400).json({ message: err.message })
    }
    return next(err)
  }
})

