import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, unique: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'client'], default: 'client' }
}, { timestamps: true, collection: 'users' });

const consultationSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '' },
  company_org: { type: String, default: '' },
  subject: { type: String, default: '' },
  service: { type: String, default: '' },
  message: { type: String, default: '' },
  submitted_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'dismissed'], default: 'pending' }
}, { timestamps: true, collection: 'consultations' });

function transform(_doc, ret) {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  delete ret.createdAt;
  delete ret.updatedAt;
  return ret;
}
userSchema.set('toJSON', { transform });
consultationSchema.set('toJSON', { transform });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);
