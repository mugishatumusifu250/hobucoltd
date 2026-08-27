const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// In-memory reset codes store (for demo)
const resetCodes = {};

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Welcome email HTML template
const getWelcomeEmailHTML = (username) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to HOBUCO Consulting</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 2px;">HOBUCO</h1>
              <p style="margin: 5px 0 0 0; color: #a0c4e8; font-size: 14px; letter-spacing: 4px;">CONSULTING GROUP</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a365d; font-size: 22px;">Welcome to HOBUCO Consulting, ${username}!</h2>
              <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; line-height: 1.6;">Thank you for registering with HOBUCO Consulting Group. We are delighted to have you on board!</p>
              <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; line-height: 1.6;">Your account has been successfully created. You can now access our full range of consulting services, track your requests, and communicate with our team directly through the platform.</p>
              <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.6;">If you have any questions or need assistance, please don't hesitate to reach out to us.</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 25px;">
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #2d5a87;">
                    <p style="margin: 0 0 8px 0; color: #1a365d; font-weight: bold; font-size: 14px;">Our Partners & Affiliations:</p>
                    <p style="margin: 0; color: #555555; font-size: 13px; line-height: 1.5;">HOBUCO Consulting Group works with leading global partners to deliver exceptional consulting services across Africa and beyond.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a365d; padding: 25px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: bold;">HOBUCO Consulting Group</p>
              <p style="margin: 0 0 5px 0; color: #a0c4e8; font-size: 12px;">Email: ${process.env.EMAIL_USER}</p>
              <p style="margin: 0 0 5px 0; color: #a0c4e8; font-size: 12px;">Phone: +250 788 000 000</p>
              <p style="margin: 0; color: #a0c4e8; font-size: 12px;">Kigali, Rwanda</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Reset code email HTML template
const getResetCodeEmailHTML = (code) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - HOBUCO Consulting</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 2px;">HOBUCO</h1>
              <p style="margin: 5px 0 0 0; color: #a0c4e8; font-size: 14px; letter-spacing: 4px;">CONSULTING GROUP</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <h2 style="margin: 0 0 15px 0; color: #1a365d; font-size: 22px;">Password Reset Request</h2>
              <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.6;">You have requested to reset your password. Use the verification code below to proceed:</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="background-color: #f0f4f8; padding: 20px 40px; border-radius: 8px; border: 2px dashed #2d5a87; display: inline-block;">
                      <p style="margin: 0; color: #1a365d; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${code}</p>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin: 25px 0 0 0; color: #888888; font-size: 13px;">This code will expire shortly. If you did not request this, please ignore this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a365d; padding: 25px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: bold;">HOBUCO Consulting Group</p>
              <p style="margin: 0 0 5px 0; color: #a0c4e8; font-size: 12px;">Email: ${process.env.EMAIL_USER}</p>
              <p style="margin: 0 0 5px 0; color: #a0c4e8; font-size: 12px;">Phone: +250 788 000 000</p>
              <p style="margin: 0; color: #a0c4e8; font-size: 12px;">Kigali, Rwanda</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate all fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = new User({
      username,
      email: email.toLowerCase().trim(),
      password,
      role: role || 'client',
    });
    await user.save();

    // Send welcome email
    try {
      await transporter.sendMail({
        from: `"HOBUCO Consulting" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to HOBUCO Consulting Group!',
        html: getWelcomeEmailHTML(username),
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    return res.status(201).json({ success: true, message: 'Signup successful!' });
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, remember } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Find user by username OR email
    const user = await User.findOne({
      $or: [{ username }, { email: username.toLowerCase() }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const expiresIn = remember ? '30d' : '7d';
    const maxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// POST /api/auth/forgot
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes[email.toLowerCase().trim()] = code;

    // Send email with code
    try {
      await transporter.sendMail({
        from: `"HOBUCO Consulting" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Verification Code - HOBUCO Consulting',
        html: getResetCodeEmailHTML(code),
      });
    } catch (emailError) {
      console.error('Reset code email failed:', emailError.message);
    }

    // Store email in session
    req.session = req.session || {};
    req.session.resetEmail = email.toLowerCase().trim();

    return res.status(200).json({ success: true, redirectUrl: '/verify-code' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during password reset request' });
  }
});

// POST /api/auth/verify-code
router.post('/verify-code', (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Verification code is required' });
    }

    const session = req.session || {};
    const email = session.resetEmail;

    if (!email || !resetCodes[email]) {
      return res.status(400).json({ success: false, message: 'No reset request found. Please try again.' });
    }

    if (resetCodes[email] !== code) {
      return res.status(400).json({ success: false, message: 'Invalid code' });
    }

    // Clean up the used code
    delete resetCodes[email];

    return res.status(200).json({ success: true, redirectUrl: '/reset-password' });
  } catch (error) {
    console.error('Verify code error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during code verification' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    const session = req.session || {};
    const email = session.resetEmail;

    if (!email) {
      return res.status(400).json({ success: false, message: 'No reset session found. Please start over.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    // Clean up session
    if (req.session) {
      delete req.session.resetEmail;
    }

    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
});

// GET /api/auth/me (protected)
router.get('/me', auth, (req, res) => {
  return res.status(200).json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.status(200).json({ success: true });
});

module.exports = router;
