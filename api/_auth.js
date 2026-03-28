import jwt from 'jsonwebtoken';

export function verifyAdmin(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorised' });
    return null;
  }
  try {
    return jwt.verify(auth.slice(7), process.env.ADMIN_JWT_SECRET);
  } catch {
    res.status(401).json({ error: 'Unauthorised' });
    return null;
  }
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
