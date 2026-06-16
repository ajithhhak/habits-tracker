import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET
const COOKIE = 'hf_token'

export function signToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, SECRET, { expiresIn })
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET) } catch { return null }
}

function getTokenFromReq(req) {
  // From httpOnly cookie header
  const cookieHeader = req.headers?.cookie || ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function getAuthUser(req, res) {
  const token = getTokenFromReq(req)
  if (!token) return null
  return verifyToken(token)
}

export function setAuthCookie(res, token) {
  const maxAge = 60 * 60 * 24 * 30 // 30 days
  res.setHeader('Set-Cookie',
    `${COOKIE}=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax`)
}

export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie',
    `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`)
}

export function requireAuth(handler) {
  return async (req, res) => {
    const user = getAuthUser(req, res)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    req.user = user
    return handler(req, res)
  }
}
