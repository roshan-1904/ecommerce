import mongoose from 'mongoose';

const OTPVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required']
  },
  registrationData: {
    type: Object,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Automatically deletes the document after 10 minutes (600 seconds)
  }
});

const OTPVerification = mongoose.model('OTPVerification', OTPVerificationSchema);
export default OTPVerification;
