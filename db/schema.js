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

// Tambahkan di bawah transactions
export const financialWisdom = pgTable('financial_wisdom', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 20, enum: ['quran', 'hadis', 'quote'] }).notNull(),
  text: text('text').notNull(),
  source: varchar('source', { length: 100 }).notNull(), // "QS. Al-Baqarah: 261"
  theme: varchar('theme', { length: 50 }), // 'infaq', 'zakat', 'hemat', 'riba'
  createdAt: timestamp('created_at').defaultNow(),
});
