import { setCookie, getCookie } from 'hono/cookie';

const logout = (c) => {
  setCookie(c, 'token', '', { maxAge: -1 });
  return c.json({ success: true, message: 'Logout berhasil' });
}

export default logout;