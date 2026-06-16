import jwt from 'jsonwebtoken'
import { getCookie } from 'cookies-next'

const SECRET = process.env.JWT_SECRET

export function signToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, SECRET, { expiresIn })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export function getAuthUser(req, res) {
  const token = getCookie('hf_token', { req, res })
  if (!token) return null
  return verifyToken(token)
}

export function requireAuth(handler) {
  return async (req, res) => {
    const user = getAuthUser(req, res)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    req.user = user
    return handler(req, res)
  }
}
