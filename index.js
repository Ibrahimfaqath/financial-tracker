// index.js

import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { setCookie, getCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db/index.js';
import { users, transactions } from './db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { serveStatic } from '@hono/node-server/serve-static';
import register from './controllers/registrationController.js';
import login from './controllers/loginController.js'
import logout from './controllers/logoutController.js'
import middleware from './controllers/middlewareController.js'
import addTransaction from './controllers/addTransactionController.js';
import deleteTransaction from './controllers/deleteTransactionController.js';
import updateTransaction from './controllers/updateTransactionController.js';


import seeTransaction from './controllers/seeTransactionController.js'
import authMiddleware from './controllers/authMiddlewareController.js';

import wisdom from './controllers/wisdomController.js';

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

// ,,, API HAPUS TRANSAKSI (DELETE) ,,,
app.delete('/api/transactions/:id', authMiddleware, deleteTransaction);

// ,,, API UPDATE TRANSAKSI (PUT) ,,,
app.put('/api/transactions/:id', authMiddleware, updateTransaction);

// ,,, API LIHAT TRANSAKSI PER BULAN (GET) ,,,
app.get('/api/transactions', authMiddleware, seeTransaction);

// Tambahkan di atas app.use('/*', serveStatic...)
app.get('/api/wisdom', wisdom);

// // API untuk get wisdom by theme
// app.get('/api/wisdom/:theme', async (c) => {
//   const theme = c.req.param('theme'); // 'infaq', 'zakat', etc
  
//   try {
//     const wisdom = await db.query.financialWisdom.findFirst({
//       where: (w, { eq }) => eq(w.theme, theme),
//       orderBy: sql`RANDOM()`,
//     });
    
//     return c.json({ 
//       success: true, 
//       data: wisdom 
//     });
//   } catch (error) {
//     console.error("Error getting wisdom by theme:", error);
//     return c.json({ 
//       success: false, 
//       message: 'Gagal mengambil nasihat' 
//     }, 500);
//   }
// });


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
