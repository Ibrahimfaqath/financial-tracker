import jwt from 'jsonwebtoken';
import { getCookie } from 'hono/cookie';

const SECRET = process.env.JWT_SECRET;

const middleware = (c) => {
  const token = getCookie(c, 'token');
  if (!token) return c.json({ success: false, message: 'Unauthorized' }, 401);
  try {
    const user = jwt.verify(token, SECRET);
    return c.json({ success: true, data: user });
  } catch (error) {
    return c.json({ success: false, message: 'Token tidak valid' }, 401);
  }
}

export default middleware;