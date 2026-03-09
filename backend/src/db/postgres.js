import { Client } from 'pg'
import { env } from '../config/env.js'

let client

export async function getPostgresClient() {
  if (client) {
    return client
  }

  client = new Client({
    connectionString: env.postgresUrl
  })

  await client.connect()
  return client
}

