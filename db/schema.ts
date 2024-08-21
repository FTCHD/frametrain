import type { BaseConfig, BaseStorage } from '@/lib/types'
import type templates from '@/templates'
import { createId } from '@paralleldrive/cuid2'
import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const frameTable = sqliteTable('frame', {
    id: text('id')
        .primaryKey()
        .unique()
        .notNull()
        .$defaultFn(() => createId()),
    owner: text('owner').notNull(),
    name: text('name').notNull(),
    linkedPage: text('linkedPage'),
    webhooks: text('webhooks', { mode: 'json' }).default('{}').$type<Record<string, string>>(),
    description: text('description').notNull().default('This is my Frame, forged on Frametrain.'),
    template: text('template').notNull().$type<keyof typeof templates>(),
    storage: text('state', { mode: 'json' }).default('{}').$type<BaseStorage>(),
    config: text('config', { mode: 'json' }).default('{}').$type<BaseConfig>(),
    draftConfig: text('draftConfig', { mode: 'json' }).default('{}').$type<BaseConfig>(),
    currentMonthCalls: integer('currentMonthCalls').notNull().default(0),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`)
        .$onUpdate(() => new Date()),
})

export const frameRelations = relations(frameTable, ({ many }) => ({
    interactions: many(interactionTable),
}))

export const interactionTable = sqliteTable('interaction', {
    id: text('id')
        .primaryKey()
        .unique()
        .notNull()
        .$defaultFn(() => createId()),
    frame: text('frameId').notNull(),
    buttonIndex: text('buttonIndex').notNull(),
    fid: text('fid').notNull(),
    castHash: text('castHash').notNull(),
    castFid: text('castFid').notNull(),
    inputText: text('inputText'),
    state: text('state'),
    transactionHash: text('transactionHash'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
})

export const interactionRelations = relations(interactionTable, ({ one }) => ({
    frame: one(frameTable, {
        fields: [interactionTable.frame],
        references: [frameTable.id],
    }),
}))
