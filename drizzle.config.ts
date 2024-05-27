import type { Config } from 'drizzle-kit'

const config: Config = {
    schema: './db/schema.ts',
    out: './db/migrations',
    driver: 'turso',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.TURSO_URL!,
        authToken: process.env.TURSO_SECRET!,
    },
}

export default config
