import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { getDb } from '../db/mongo.js'

const assignmentIdSchema = z.string().transform((id) => new ObjectId(id))

const sampleAssignments = [
  {
    title: 'Orders and Customers Basics',
    difficulty: 'easy',
    shortDescription: 'Practice SELECTs and simple filters on orders and customers.',
    question:
      'Write a query to list all orders with the customer name, order date, and total amount for orders placed in the last 30 days.',
    schemaSummary:
      'Two tables: customers(id, name, email, city) and orders(id, customer_id, order_date, total_amount).',
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'id', type: 'INT', description: 'Primary key' },
          { name: 'name', type: 'VARCHAR', description: 'Customer full name' },
          { name: 'email', type: 'VARCHAR', description: 'Customer email address' },
          { name: 'city', type: 'VARCHAR', description: 'City of the customer' }
        ]
      },
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'INT', description: 'Primary key' },
          { name: 'customer_id', type: 'INT', description: 'FK to customers.id' },
          { name: 'order_date', type: 'DATE', description: 'Date the order was placed' },
          { name: 'total_amount', type: 'DECIMAL', description: 'Total order value' }
        ]
      }
    ]
  },
  {
    title: 'Movie Ratings Aggregation',
    difficulty: 'medium',
    shortDescription: 'Use GROUP BY and HAVING with movie ratings.',
    question:
      'Find the top 5 movies by average rating with at least 50 ratings, showing title, avg_rating, and rating_count.',
    schemaSummary:
      'Tables: movies(id, title, release_year) and ratings(id, movie_id, user_id, rating, rated_at).',
    tables: [
      {
        name: 'movies',
        columns: [
          { name: 'id', type: 'INT' },
          { name: 'title', type: 'VARCHAR' },
          { name: 'release_year', type: 'INT' }
        ]
      },
      {
        name: 'ratings',
        columns: [
          { name: 'id', type: 'INT' },
          { name: 'movie_id', type: 'INT' },
          { name: 'user_id', type: 'INT' },
          { name: 'rating', type: 'INT' },
          { name: 'rated_at', type: 'TIMESTAMP' }
        ]
      }
    ]
  }
]

export async function ensureSeedAssignments() {
  const db = await getDb()
  const collection = db.collection('assignments')
  const count = await collection.estimatedDocumentCount()
  if (count === 0) {
    await collection.insertMany(sampleAssignments)
  }
}

export async function listAssignments() {
  const db = await getDb()
  const collection = db.collection('assignments')
  const docs = await collection
    .find({}, { projection: { title: 1, difficulty: 1, shortDescription: 1 } })
    .sort({ difficulty: 1 })
    .toArray()

  return docs.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    difficulty: doc.difficulty,
    shortDescription: doc.shortDescription
  }))
}

export async function getAssignmentById(id) {
  const objectId = assignmentIdSchema.parse(id)
  const db = await getDb()
  const collection = db.collection('assignments')
  const doc = await collection.findOne({ _id: objectId })
  if (!doc) return null

  return {
    id: doc._id.toString(),
    title: doc.title,
    difficulty: doc.difficulty,
    shortDescription: doc.shortDescription,
    question: doc.question,
    schemaSummary: doc.schemaSummary,
    tables: doc.tables ?? []
  }
}

