import type { Config } from 'drizzle-kit'

export default process.env.DB
    ? ({
          schema: './db/schema.ts',
          driver: 'better-sqlite',
          dbCredentials: {
              url: process.env.DB!,
          },
      } satisfies Config)
    : ({
          schema: './db/schema.ts',
          out: './db/migrations',
          driver: 'd1',
          dbCredentials: {
              wranglerConfigPath: 'wrangler.toml',
              dbName: 'frametrain',
          },
      } satisfies Config)
