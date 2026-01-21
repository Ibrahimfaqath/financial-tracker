import jwt from 'jsonwebtoken';
import { getCookie } from 'hono/cookie';

const SECRET = process.env.JWT_SECRET;

const authMiddleware = async (c, next) => {
  const token = getCookie(c, 'token');
  if (!token) return c.json({ success: false, message: 'Unauthorized' }, 401);
  try {
    const user = jwt.verify(token, SECRET);
    c.set('user', user); // Menyimpan data user di context Hono
    await next();
  } catch (error) {
    return c.json({ success: false, message: 'Token tidak valid' }, 401);
  }
}

export default authMiddleware;