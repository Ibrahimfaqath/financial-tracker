// index.js

import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
// import { setCookie, getCookie } from 'hono/cookie';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { db } from './db/index.js';
// import { users, transactions } from './db/schema.js';
// import { eq, desc, sql } from 'drizzle-orm';
import { serveStatic } from '@hono/node-server/serve-static';
import register from './controllers/registrationController.js';
import login from './controllers/loginController.js'
import logout from './controllers/logoutController.js'
import middleware from './controllers/middlewareController.js'
import addTransaction from './controllers/addTransactionController.js';
import seeTransaction from './controllers/seeTransactionController.js'
import authMiddleware from './controllers/authMiddlewareController.js';

const app = new Hono();
// const SECRET = process.env.JWT_SECRET;


// ,,, API REGISTRASI ,,,
app.post('/api/register', register);

// ,,, API LOGIN ,,,
app.post('/api/login', login);

// ,,, API LOGOUT ,,,
app.post('/api/logout', logout);

// ,,, MIDDLEWARE & API ME ,,,
app.get('/api/me', middleware);

// ,,, API TAMBAH TRANSAKSI (POST) ,,,
app.post('/api/transactions', authMiddleware, addTransaction);

// ,,, API LIHAT TRANSAKSI PER BULAN (GET) ,,,
app.get('/api/transactions', authMiddleware, seeTransaction);


app.use('/*', serveStatic({ root: './public' }));

// ,,, SERVER START ,,,
// Logika Vercel (akan ditambahkan nanti)
if (process.env.VERCEL) {
  globalThis.app = app;
} else {
  const port = 9999;
  console.log(`🚀 Server is running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}
