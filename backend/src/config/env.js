
import dotenv from 'dotenv'
dotenv.config()
import { z } from 'zod'

const envSchema = z.object({
  PORT: z
    .string()
    .transform((v) => Number(v))
    .pipe(z.number().int().positive())
    .default('4000'.toString()),
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  CLIENT_ORIGIN: z.string().optional()
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment configuration')
}

export const env = {
  port: parsed.data.PORT,
  postgresUrl: parsed.data.POSTGRES_URL,
  mongodbUri: parsed.data.MONGODB_URI,
  geminiApiKey: parsed.data.GEMINI_API_KEY,
  clientOrigin: parsed.data.CLIENT_ORIGIN
}

