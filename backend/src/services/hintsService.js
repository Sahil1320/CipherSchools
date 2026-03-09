import { z } from 'zod'
import fetch from 'node-fetch'
import { env } from '../config/env.js'
import { getAssignmentById } from './assignmentsService.js'
import { getDb } from '../db/mongo.js'

const hintSchema = z.object({
  assignmentId: z.string(),
  sql: z.string().optional()
})

class HintError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'HintError'
    this.status = status
  }
}

export async function generateHint(payload) {
  const { assignmentId, sql } = hintSchema.parse(payload)

  const assignment = await getAssignmentById(assignmentId)
  if (!assignment) {
    throw new HintError('Assignment not found.', 404)
  }

  const db = await getDb()
  const lastAttempt = await db
    .collection('attempts')
    .find({ assignmentId })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray()

  const latestAttempt = lastAttempt[0]

  const promptParts = [
    'You are an SQL tutor helping a student solve a query assignment.',
    'Give conceptual guidance, highlight mistakes, and suggest next steps, but DO NOT give the full final SQL query.',
    '',
    `Assignment title: ${assignment.title}`,
    `Question: ${assignment.question}`,
    '',
    'Schema summary:',
    assignment.schemaSummary,
    '',
    'Tables:',
    ...(assignment.tables || []).map(
      (t) =>
        `- ${t.name} (${(t.columns || [])
          .map((c) => `${c.name} ${c.type || ''}`.trim())
          .join(', ')})`
    )
  ]

  if (sql) {
    promptParts.push('', 'Student current SQL attempt:', sql)
  } else if (latestAttempt?.sql) {
    promptParts.push('', 'Most recent student SQL attempt:', latestAttempt.sql)
  }

  if (latestAttempt?.errorMessage) {
    promptParts.push('', 'Database error from last attempt:', latestAttempt.errorMessage)
  }
  

promptParts.push(
  '',
  'Write the hint in plain text.',
  'Do not use backticks or code formatting.',
  'Provide 4 to 6 full sentences explaining what the student is doing right and what is missing.',
  'Do NOT provide the final SQL query.'
)
const prompt = promptParts.join('\n')
 
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' +
    encodeURIComponent(env.geminiApiKey),
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  body: JSON.stringify({
  contents: [
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ],
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 600
  }
})
  }
)

  if (!response.ok) {
    const text = await response.text()
    throw new HintError(`Failed to get hint from Gemini: ${text}`, 502)
  }

  const data = await response.json()
  const hintText =
  data.candidates?.[0]?.content?.parts
    ?.map(p => p.text)
    .join(" ")
    .replace(/`/g, "")
    .trim() || "No hint generated."

  await db.collection('hints').insertOne({
    assignmentId,
    sql: sql || latestAttempt?.sql || null,
    hint: hintText,
    createdAt: new Date()
  })

  return { hint: hintText }
}

export { HintError }

