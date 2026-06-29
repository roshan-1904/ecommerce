import mongoose from 'mongoose';

const EnquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message text is required']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  replyText: {
    type: String,
    default: ''
  },
  isReplied: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Enquiry = mongoose.model('Enquiry', EnquirySchema);
export default Enquiry;
