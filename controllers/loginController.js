import { db } from '../db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema.js';
import { setCookie, } from 'hono/cookie';

const SECRET = process.env.JWT_SECRET;

const login = async (c) => {
  const { username, password } = await c.req.json();
  const user = await db.query.users.findFirst({ where: eq(users.username, username) });

  if (!user) return c.json({ success: false, message: 'Username atau password salah' }, 401);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return c.json({ success: false, message: 'Username atau password salah' }, 401);

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1d' });
  setCookie(c, 'token', token, { httpOnly: true, sameSite: 'Lax', maxAge: 86400 });

  return c.json({ success: true, message: 'Login berhasil' });
}

export default login;