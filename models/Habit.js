import mongoose from 'mongoose'

const HabitSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:      { type: String, required: true, trim: true },
  icon:      { type: String, default: '✨' },
  color:     { type: String, default: '#14b8a6' },
  category:  { type: String, enum: ['health','mind','fitness','learning','social','custom'], default: 'custom' },
  isActive:  { type: Boolean, default: true },
  order:     { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema)
