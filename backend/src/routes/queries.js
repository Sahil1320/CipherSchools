import express from 'express'
import { executeAssignmentQuery, QueryValidationError } from '../services/queryService.js'

export const queriesRouter = express.Router()

queriesRouter.post('/execute', async (req, res, next) => {
  try {
    const result = await executeAssignmentQuery(req.body)
    res.json({ result })
  } catch (err) {
    if (err instanceof QueryValidationError) {
      return res.status(err.status || 400).json({ message: err.message })
    }
    return next(err)
  }
})

