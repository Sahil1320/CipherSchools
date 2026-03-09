
import { MongoClient } from 'mongodb'
import { env } from '../config/env.js'

let client

export async function getMongoClient() {
  if (client) {
    return client
  }

  client = new MongoClient(env.mongodbUri)
  await client.connect()
  return client
}

export async function getDb() {
  const mongoClient = await getMongoClient()
  return mongoClient.db()
}

