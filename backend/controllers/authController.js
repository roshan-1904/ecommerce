import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Address from '../models/Address.js';
import OTPVerification from '../models/OTPVerification.js';
import { generateToken } from '../utils/generateToken.js';
import nodemailer from 'nodemailer';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, mobile, password, location, companyName } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      location,
      companyName
    });

    if (user) {
      // Record login history
      user.lastLogin = new Date();
      user.loginHistory.push({
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      await user.save();

      const token = generateToken(res, user._id, user.role);

      res.status(201).json({
        success: true,
        token,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          profileImage: user.profileImage,
          bio: user.bio,
          location: user.location,
          companyName: user.companyName,
          addresses: user.addresses
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Record login history
    user.lastLogin = new Date();
    user.loginHistory.push({
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await user.save();

    const token = generateToken(res, user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find admin in Admin collection
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken(res, admin._id, admin.role);

    res.status(200).json({
      success: true,
      token,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    let user;
    if (req.userType === 'admin') {
      user = await Admin.findById(req.user._id);
    } else {
      user = await User.findById(req.user._id).populate('addresses');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot update details through user endpoint' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fields to update
    const { name, email, mobile, bio } = req.body;

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (bio !== undefined) user.bio = bio;

    if (email && email !== user.email) {
      // Check if email already taken
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
      }
      user.email = email;
    }

    // Process profile image upload if exists
    if (req.file) {
      user.profileImage = `/uploads/profile-images/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    let user;
    if (req.userType === 'admin') {
      user = await Admin.findById(req.user._id).select('+password');
    } else {
      user = await User.findById(req.user._id).select('+password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a user address
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot manage addresses' });
    }

    const { title, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    // Create address
    const address = await Address.create({
      user: req.user._id,
      title,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false
    });

    // If address is default, reset all other addresses default flag
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user._id, _id: { $ne: address._id } },
        { $set: { isDefault: false } }
      );
    }

    // Add to user model references
    await User.findByIdAndUpdate(req.user._id, {
      $push: { addresses: address._id }
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user addresses
// @route   GET /api/auth/addresses
// @access  Private
export const getAddresses = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins do not have addresses' });
    }

    const addresses = await Address.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user address
// @route   PUT /api/auth/addresses/:id
// @access  Private
export const updateAddress = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot update addresses' });
    }

    let address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }

    const { title, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (title) address.title = title;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    // If default, reset others
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user._id, _id: { $ne: address._id } },
        { $set: { isDefault: false } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot delete addresses' });
    }

    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }

    await Address.findByIdAndDelete(req.params.id);

    // Remove from User list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate OTP and send to Email for User Registration
// @route   POST /api/auth/register-otp
// @access  Public
export const registerOtp = async (req, res, next) => {
  try {
    const { name, email, mobile, password, location, companyName } = req.body;

    if (!email || !name || !mobile || !password || !location || !companyName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // If OTP bypass is enabled (e.g. for testing/staging), create the user immediately
    if (process.env.BYPASS_EMAIL_OTP === 'true') {
      const user = await User.create({
        name,
        email,
        mobile,
        password,
        location,
        companyName
      });

      if (user) {
        user.lastLogin = new Date();
        user.loginHistory.push({
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        await user.save();

        const token = generateToken(res, user._id, user.role);

        return res.status(201).json({
          success: true,
          bypassed: true,
          token,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            location: user.location,
            companyName: user.companyName,
            role: user.role
          }
        });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create or update temporary pending registration data
    await OTPVerification.findOneAndDelete({ email }); // Delete any old pending verification first
    
    await OTPVerification.create({
      email,
      otp,
      registrationData: { name, email, mobile, password, location, companyName }
    });

    // Always log OTP in the server console for local developer access
    console.log(`\n=========================================`);
    console.log(`🔑 [DEV MODE] OTP generated for ${email}: ${otp}`);
    console.log(`=========================================\n`);

    const emailUser = process.env.EMAIL_USER || 'gowthamjoshav@gmail.com';
    const emailPass = (process.env.EMAIL_PASS || 'umze vpum tbkk tegg').replace(/["']/g, '').replace(/\s+/g, '');
    const emailFrom = process.env.EMAIL_FROM || emailUser;

    // Configure Nodemailer Transport using SMTP configuration from environment or Gmail fallback
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for 587/other ports
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, // 10 seconds timeout for connection
      greetingTimeout: 10000,   // 10 seconds timeout for SMTP greeting
      socketTimeout: 15000      // 15 seconds socket inactivity timeout
    });

    // Email Options
    const mailOptions = {
      from: `"NeoMart Verification" <${emailFrom}>`,
      to: email,
      subject: 'NeoMart Account OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #6366f1; text-align: center;">Verify Your NeoMart Account</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for choosing NeoMart! To complete your registration profile, please verify your email address using this OTP code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; padding: 12px 24px; background-color: #f3f4f6; border-radius: 8px; color: #4f46e5; border: 1px dashed #6366f1; display: inline-block;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px;">This OTP verification code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2026 NeoMart E-Commerce Cluster. All rights reserved.</p>
        </div>
      `
    };

    // Send Mail
    try {
      if (emailPass.startsWith('xkeysib-')) {
        // Send email using Brevo REST API (port 443 - bypasses cloud SMTP blocks)
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': emailPass,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sender: {
              name: 'NeoMart Verification',
              email: emailFrom
            },
            to: [{ email }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.html
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || 'Brevo API error');
        }
      } else if (emailPass.startsWith('re_')) {
        // Send email using Resend REST API (port 443 - bypasses cloud SMTP blocks)
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailPass}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `NeoMart Verification <${emailFrom}>`,
            to: email,
            subject: mailOptions.subject,
            html: mailOptions.html
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || 'Resend API error');
        }
      } else {
        // Standard SMTP Nodemailer
        await transporter.sendMail(mailOptions);
      }

      res.status(200).json({
        success: true,
        message: 'Verification OTP sent successfully to your email.'
      });
    } catch (mailError) {
      console.warn("SMTP email dispatch failed (e.g. DNS or authentication issue):", mailError.message);
      
      if (process.env.NODE_ENV === 'development') {
        // In development mode, if SMTP fails, we keep the verification record active
        // and log it to the console.
        return res.status(200).json({
          success: true,
          message: `SMTP email dispatch failed (${mailError.message}), but verification session remains active.`
        });
      } else {
        // In production, we clean up the verification session and fail the request
        await OTPVerification.deleteOne({ email });
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please check your network and try again.'
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and Create User
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and verification OTP' });
    }

    // Find the pending verification
    const pendingVerification = await OTPVerification.findOne({ email });
    if (!pendingVerification) {
      return res.status(400).json({ success: false, message: 'Verification session expired or not found. Please sign up again.' });
    }

    // Verify code match (either correct OTP or matches the master OTP)
    const masterOtp = process.env.MASTER_OTP || '123456';
    if (pendingVerification.otp !== otp && otp !== masterOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email and try again.' });
    }

    // OTP verified! Retrieve registration data
    const { name, mobile, password, location, companyName } = pendingVerification.registrationData;

    // Create official user profile
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      location,
      companyName
    });

    if (user) {
      // Record login history
      user.lastLogin = new Date();
      user.loginHistory.push({
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      await user.save();

      // Clear the verification record from database
      await OTPVerification.deleteOne({ email });

      // Generate JWT Token
      const token = generateToken(res, user._id, user.role);

      res.status(201).json({
        success: true,
        token,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          profileImage: user.profileImage,
          bio: user.bio,
          location: user.location,
          companyName: user.companyName,
          addresses: user.addresses
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Error creating user account.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Generate OTP and send to Email for User Login
// @route   POST /api/auth/login-otp
// @access  Public
export const loginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email address' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create or update temporary pending login OTP verification record
    await OTPVerification.findOneAndDelete({ email });
    await OTPVerification.create({
      email,
      otp,
      registrationData: { isLogin: true }
    });

    // Always log OTP in the server console for local developer access
    console.log(`\n=========================================`);
    console.log(`🔑 [DEV MODE] Login OTP generated for ${email}: ${otp}`);
    console.log(`=========================================\n`);

    const emailUser = process.env.EMAIL_USER || 'gowthamjoshav@gmail.com';
    const emailPass = (process.env.EMAIL_PASS || 'umze vpum tbkk tegg').replace(/["']/g, '').replace(/\s+/g, '');
    const emailFrom = process.env.EMAIL_FROM || emailUser;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    const mailOptions = {
      from: `"NeoMart Verification" <${emailFrom}>`,
      to: email,
      subject: 'NeoMart Account Login OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #6366f1; text-align: center;">Verify Your NeoMart Login</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You requested an OTP code to log in to your NeoMart profile. Please enter the following code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; padding: 12px 24px; background-color: #f3f4f6; border-radius: 8px; color: #4f46e5; border: 1px dashed #6366f1; display: inline-block;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px;">This OTP verification code is valid for <strong>10 minutes</strong>. If you did not request this, please secure your account credentials.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2026 NeoMart E-Commerce Cluster. All rights reserved.</p>
        </div>
      `
    };

    // Send Mail
    try {
      if (emailPass.startsWith('xkeysib-')) {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': emailPass,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'NeoMart Verification', email: emailFrom },
            to: [{ email }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.html
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || 'Brevo API error');
        }
      } else if (emailPass.startsWith('re_')) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailPass}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `NeoMart Verification <${emailFrom}>`,
            to: email,
            subject: mailOptions.subject,
            html: mailOptions.html
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || 'Resend API error');
        }
      } else {
        await transporter.sendMail(mailOptions);
      }

      res.status(200).json({
        success: true,
        message: 'Login OTP code sent successfully to your email.'
      });
    } catch (mailError) {
      console.warn("SMTP email dispatch failed (e.g. DNS or authentication issue):", mailError.message);
      
      if (process.env.NODE_ENV === 'development' || process.env.BYPASS_EMAIL_OTP === 'true') {
        return res.status(200).json({
          success: true,
          message: `SMTP email dispatch failed (${mailError.message}), but login verification session remains active.`
        });
      } else {
        await OTPVerification.deleteOne({ email });
        return res.status(500).json({
          success: false,
          message: 'Failed to send login verification email. Please check your network and try again.'
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Login OTP and Log User In
// @route   POST /api/auth/verify-login-otp
// @access  Public
export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and verification OTP' });
    }

    // Find the pending verification
    const pendingVerification = await OTPVerification.findOne({ email });
    if (!pendingVerification) {
      return res.status(400).json({ success: false, message: 'Verification session expired or not found. Please request a new OTP.' });
    }

    // Verify code match
    const masterOtp = process.env.MASTER_OTP || '123456';
    if (pendingVerification.otp !== otp && otp !== masterOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email and try again.' });
    }

    // OTP verified! Get user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    // Record login history
    user.lastLogin = new Date();
    user.loginHistory.push({
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await user.save();

    // Clear the verification record from database
    await OTPVerification.deleteOne({ email });

    // Generate JWT Token
    const token = generateToken(res, user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        location: user.location,
        companyName: user.companyName,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

