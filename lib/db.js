import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

let cached = global._mongoose
if (!cached) cached = global._mongoose = { conn: null, promise: null }

export async function connectDB() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is not set')
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }).then(m => m).catch(err => {
      cached.promise = null
      throw err
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}
