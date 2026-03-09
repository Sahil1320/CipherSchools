import express from 'express'
import { listAssignments, getAssignmentById } from '../services/assignmentsService.js'

export const assignmentsRouter = express.Router()

assignmentsRouter.get('/', async (req, res, next) => {
  try {
    const assignments = await listAssignments()
    res.json({ assignments })
  } catch (err) {
    next(err)
  }
})

assignmentsRouter.get('/:id', async (req, res, next) => {
  try {
    const assignment = await getAssignmentById(req.params.id)
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }
    res.json({ assignment })
  } catch (err) {
    next(err)
  }
})

