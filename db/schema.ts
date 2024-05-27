import type { BaseConfig, BaseState } from '@/lib/types'
import type templates from '@/templates'
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
    template: text('template').notNull().$type<keyof typeof templates>(),
    state: text('state', { mode: 'json' }).default('{}').$type<BaseState>(),
    config: text('config', { mode: 'json' }).default('{}').$type<BaseConfig>(),
    draftConfig: text('draftConfig', { mode: 'json' }).default('{}').$type<BaseConfig>(),
    currentMonthCalls: integer('currentMonthCalls').notNull().default(0),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`)
        .$onUpdate(() => new Date()),
})
