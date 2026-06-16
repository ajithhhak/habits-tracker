import mongoose from 'mongoose'

// One document per user per day — stores all habit completions for that day
const HabitLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date:      { type: String, required: true, index: true },  // 'YYYY-MM-DD'
  ticks:     { type: Map, of: Boolean, default: {} },        // { habitId: true/false }
  mood:      { type: String, default: '' },                  // emoji
  note:      { type: String, default: '' },
  completedCount: { type: Number, default: 0 },
  totalCount:     { type: Number, default: 0 },
  pct:            { type: Number, default: 0 },
}, { timestamps: true })

HabitLogSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.models.HabitLog || mongoose.model('HabitLog', HabitLogSchema)
