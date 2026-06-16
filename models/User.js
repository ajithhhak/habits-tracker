import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:         { type: String, required: true, trim: true },
  password:      { type: String, required: true, minlength: 6 },
  avatar:        { type: String, default: '' },          // Cloudinary URL
  avatarPublicId:{ type: String, default: '' },
  isVerified:    { type: Boolean, default: false },
  otp:           { type: String },
  otpExpiry:     { type: Date },
  timezone:      { type: String, default: 'Asia/Kolkata' },
  joinedAt:      { type: Date, default: Date.now },
  lastLogin:     { type: Date },
  streak:        { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalDaysCompleted: { type: Number, default: 0 },
}, { timestamps: true })

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password)
}

UserSchema.methods.toSafeObject = function() {
  const obj = this.toObject()
  delete obj.password
  delete obj.otp
  delete obj.otpExpiry
  return obj
}

export default mongoose.models.User || mongoose.model('User', UserSchema)
