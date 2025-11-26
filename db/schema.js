// db/schema.js

import { pgTable, serial, varchar, text, integer, timestamp, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 256 }).notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  nominal: numeric('nominal', { precision: 15, scale: 2 }).notNull(), // Menyimpan nilai mata uang
  transactionDate: timestamp('transaction_date', { mode: 'string' }).notNull(), // Format YYYY-MM-DD
  status: varchar('status', { length: 10, enum: ['income', 'outcome'] }).notNull(),
  description: text('description'),
});
