const express = require('express');
const Consultation = require('../models/Consultation');
const { auth, roleCheck } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email template for approval/dismissal notification
const getActionEmailHTML = (firstName, lastName, action) => {
  const isApproved = action === 'approve';
  const statusText = isApproved ? 'Approved' : 'Dismissed';
  const statusColor = isApproved ? '#16a34a' : '#dc2626';
  const messageText = isApproved
    ? 'We are pleased to inform you that your consultation request has been approved. Our team will be in touch with you shortly to schedule your consultation.'
    : 'We regret to inform you that your consultation request could not be accommodated at this time. We encourage you to reach out again in the future as our availability may change.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation ${statusText} - HOBUCO Consulting</title>
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
              <div style="display: inline-block; padding: 10px 30px; border-radius: 25px; margin-bottom: 20px; background-color: ${statusColor};">
                <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">${statusText}</p>
              </div>
              <h2 style="margin: 0 0 15px 0; color: #1a365d; font-size: 22px;">Consultation Request Update</h2>
              <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; line-height: 1.6;">Dear ${firstName} ${lastName},</p>
              <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.6;">${messageText}</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid ${statusColor}; text-align: left;">
                    <p style="margin: 0 0 8px 0; color: #1a365d; font-weight: bold; font-size: 14px;">What's Next:</p>
                    ${isApproved
                      ? '<p style="margin: 0; color: #555555; font-size: 13px; line-height: 1.5;">Our consulting team will contact you via email to arrange the details of your consultation. Please keep an eye on your inbox.</p>'
                      : '<p style="margin: 0; color: #555555; font-size: 13px; line-height: 1.5;">Feel free to submit a new consultation request at any time. We appreciate your interest in HOBUCO Consulting Group.</p>'
                    }
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

// GET /api/requests/
router.get('/', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ submitted_at: -1 });
    return res.status(200).json({ success: true, consultations });
  } catch (error) {
    console.error('Get requests error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching requests' });
  }
});

// POST /api/requests/action/:id
router.post('/action/:id', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const { action } = req.body;
    const { id } = req.params;

    if (!action || !['approve', 'dismiss'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or dismiss' });
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'dismissed';
    consultation.status = newStatus;
    await consultation.save();

    // Send email notification
    try {
      await transporter.sendMail({
        from: `"HOBUCO Consulting" <${process.env.EMAIL_USER}>`,
        to: consultation.email,
        subject: `Your Consultation Request Has Been ${action === 'approve' ? 'Approved' : 'Reviewed'} - HOBUCO Consulting`,
        html: getActionEmailHTML(consultation.first_name, consultation.last_name, action),
      });
    } catch (emailError) {
      console.error('Action notification email failed:', emailError.message);
    }

    const message = action === 'approve' ? 'Consultation approved' : 'Consultation dismissed';
    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Request action error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error processing action' });
  }
});

module.exports = router;
