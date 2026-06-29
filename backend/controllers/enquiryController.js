import Enquiry from '../models/Enquiry.js';

// @desc    Submit a new enquiry
// @route   POST /api/enquiries
// @access  Public
export const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. We will contact you soon.',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private/Admin
export const getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enquiry
// @route   GET /api/enquiries/:id
// @access  Private/Admin
export const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    // Mark as read since it was viewed
    enquiry.isRead = true;
    await enquiry.save();

    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to an enquiry
// @route   PUT /api/enquiries/:id/reply
// @access  Private/Admin
export const replyToEnquiry = async (req, res, next) => {
  try {
    const { replyText } = req.body;

    if (!replyText) {
      return res.status(400).json({ success: false, message: 'Please provide reply text' });
    }

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    enquiry.replyText = replyText;
    enquiry.isReplied = true;
    enquiry.isRead = true;
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Reply logged successfully',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an enquiry
// @route   DELETE /api/enquiries/:id
// @access  Private/Admin
export const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    await Enquiry.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    next(error);
  }
};
