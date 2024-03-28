import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const frameTable = sqliteTable('frame', {
    id: text('id')
        .primaryKey()
        .unique()
        .notNull()
        .$defaultFn(() => createId()),
    owner: text('owner').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default('This is my Frame, forged on Frametrain.'),
    template: text('template').notNull(),
    state: text('state', { mode: 'json' }).default('{}'),
    config: text('config', { mode: 'json' }).default('{}'),
    draftConfig: text('draftConfig', { mode: 'json' }).default('{}'),
    currentMonthCalls: integer('currentMonthCalls').notNull().default(0),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
})
