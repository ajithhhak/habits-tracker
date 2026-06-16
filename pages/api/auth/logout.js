import { deleteCookie } from 'cookies-next'

export default function handler(req, res) {
  deleteCookie('hf_token', { req, res, path: '/' })
  res.status(200).json({ message: 'Logged out' })
}
