import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

const turso = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_SECRET!,
})

export const client = drizzle(turso)
