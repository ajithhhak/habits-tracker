export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    env: {
      hasMongo: !!process.env.MONGODB_URI,
      hasJwt: !!process.env.JWT_SECRET,
      hasEmail: !!process.env.EMAIL_USER,
    }
  })
}
