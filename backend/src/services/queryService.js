import { z } from 'zod'
import { getPostgresClient } from '../db/postgres.js'
import { getDb } from '../db/mongo.js'
import { getAssignmentById } from './assignmentsService.js'

const executeSchema = z.object({
  assignmentId: z.string(),
  sql: z.string().min(1, 'SQL is required')
})

class QueryValidationError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'QueryValidationError'
    this.status = status
  }
}

function assertSafeSql(sql) {
  const trimmed = sql.trim()

  if (!/^select\b/i.test(trimmed)) {
    throw new QueryValidationError('Only SELECT queries are allowed for this assignment.', 400)
  }

  if (/[;]+/.test(trimmed.replace(/;+$/, ''))) {
    throw new QueryValidationError('Only a single statement is allowed.', 400)
  }

  const forbidden = /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|commit|rollback)\b/i
  if (forbidden.test(trimmed)) {
    throw new QueryValidationError('Only read-only queries are allowed.', 400)
  }
}

export async function executeAssignmentQuery(payload) {
  const { assignmentId, sql } = executeSchema.parse(payload)

  const assignment = await getAssignmentById(assignmentId)
  if (!assignment) {
    throw new QueryValidationError('Assignment not found.', 404)
  }

  assertSafeSql(sql)

  const client = await getPostgresClient()

  const startedAt = Date.now()
  let status = 'success'
  let errorMessage = null
  let resultSummary = null

  try {
    const result = await client.query(sql)

    const columns = result.fields.map((f) => f.name)
    const rows = result.rows
    const executionTimeMs = Date.now() - startedAt

    resultSummary = {
      columns,
      rows,
      rowCount: result.rowCount,
      executionTimeMs
    }
    return resultSummary
  } catch (err) {
    status = 'error'
    errorMessage = err.message || 'Query execution failed.'
    if (err instanceof QueryValidationError) {
      throw err
    }
    const wrapped = new QueryValidationError(errorMessage, 400)
    throw wrapped
  } finally {
    const db = await getDb()
    await db.collection('attempts').insertOne({
      assignmentId,
      sql,
      status,
      errorMessage,
      createdAt: new Date(),
      summary: resultSummary
    })
  }
}

export { QueryValidationError }

