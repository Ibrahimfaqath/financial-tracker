import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { db } from './db/index.js';
import { users, transactions } from './db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

// Import Controllers
import register from './controllers/registrationController.js';
import login from './controllers/loginController.js';
import logout from './controllers/logoutController.js';
import middleware from './controllers/middlewareController.js';
import addTransaction from './controllers/addTransactionController.js';
import deleteTransaction from './controllers/deleteTransactionController.js';
import updateTransaction from './controllers/updateTransactionController.js';
import seeTransaction from './controllers/seeTransactionController.js';
import authMiddleware from './controllers/authMiddlewareController.js';
import wisdom from './controllers/wisdomController.js';

const app = new Hono();

// --- API Routes ---
app.post('/api/register', register);
app.post('/api/login', login);
app.post('/api/logout', logout);
app.get('/api/me', middleware);
app.post('/api/transactions', authMiddleware, addTransaction);
app.delete('/api/transactions/:id', authMiddleware, deleteTransaction);
app.put('/api/transactions/:id', authMiddleware, updateTransaction);
app.get('/api/transactions', authMiddleware, seeTransaction);
app.get('/api/wisdom', wisdom);

// --- Static Files ---
// Di Vercel, middleware ini seringkali dilewati karena vercel.json, 
// tapi tetap ada untuk testing lokal.
app.use('/*', serveStatic({ root: './public' }));

// --- Server Start Logic ---
if (process.env.NODE_ENV !== 'production') {
  const port = 9999;
  console.log(`🚀 Server is running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

// WAJIB: Ini yang mencegah error "No exports found" di Vercel
export default app;