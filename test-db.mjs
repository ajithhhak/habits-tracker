import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const dbUri = process.env.MONGODB_URI;
await mongoose.connect(dbUri);

const HabitLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date:      { type: String, required: true, index: true },
  ticks:     { type: Map, of: Boolean, default: {} },
  mood:      { type: String, default: '' },
  note:      { type: String, default: '' },
  completedCount: { type: Number, default: 0 },
  totalCount:     { type: Number, default: 0 },
  pct:            { type: Number, default: 0 },
}, { timestamps: true });

const HabitLog = mongoose.models.HabitLog || mongoose.model('HabitLog', HabitLogSchema);

const logs = await HabitLog.find();
console.log(JSON.stringify(logs, null, 2));

process.exit(0);
