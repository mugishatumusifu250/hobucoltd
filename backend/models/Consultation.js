const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  company_org: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  service: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'dismissed'],
    default: 'pending',
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Consultation', consultationSchema);
