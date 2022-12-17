import { z } from 'zod'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['test', 'development', 'staging', 'production']),
    LOG_LEVEL: z.enum(['info', 'error', 'silly', 'warn', 'debug']),
    PORT: z.preprocess(arg => parseInt(`${arg}`), z.number()),
  })
  .passthrough()

export const env: z.infer<typeof envSchema> = envSchema.parse(process.env)
