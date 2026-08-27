const express = require('express');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const { auth, roleCheck } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');

const router = express.Router();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Consultation confirmation email to user
const getConfirmationEmailHTML = (firstName, lastName, subject, service) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation Request Received - HOBUCO Consulting</title>
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
              <h2 style="margin: 0 0 15px 0; color: #1a365d; font-size: 22px;">Consultation Request Received!</h2>
              <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; line-height: 1.6;">Dear ${firstName} ${lastName},</p>
              <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; line-height: 1.6;">Thank you for your consultation request. We have successfully received your inquiry and our team will review it shortly.</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #2d5a87;">
                    <p style="margin: 0 0 8px 0; color: #1a365d; font-weight: bold; font-size: 14px;">Request Details:</p>
                    <p style="margin: 0 0 5px 0; color: #555555; font-size: 13px;"><strong>Subject:</strong> ${subject || 'N/A'}</p>
                    <p style="margin: 0 0 5px 0; color: #555555; font-size: 13px;"><strong>Service:</strong> ${service || 'N/A'}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">We will get back to you as soon as possible. Thank you for choosing HOBUCO Consulting Group.</p>
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

// Notification email to admin
const getAdminNotificationEmailHTML = (consultation) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Consultation Request - HOBUCO Consulting</title>
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
              <h2 style="margin: 0 0 15px 0; color: #1a365d; font-size: 22px;">New Consultation Request</h2>
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">A new consultation request has been submitted on the platform:</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #2d5a87;">
                    <p style="margin: 0 0 8px 0; color: #1a365d; font-weight: bold; font-size: 14px;">Client Details:</p>
                    <p style="margin: 0 0 5px 0; color: #555555; font-size: 13px;"><strong>Name:</strong> ${consultation.first_name} ${consultation.last_name}</p>
                    <p style="margin: 0 0 5px 0; color: #555555; font-size: 13px;"><strong>Email:</strong> ${consultation.email}</p>
                    <p style="margin: 0 0 5px 0; color: #555555; font-size: 13px;"><strong>Phone:</strong> ${consultation.phone || 'N/A'}</p>
                    <p style="margin: 0 0 5px 0; color: #555555; font-size: 13px;"><strong>Company:</strong> ${consultation.company_org || 'N/A'}</p>
                    <p style="margin: 0 0 5px 0; color: #555555; font-size: 13px;"><strong>Subject:</strong> ${consultation.subject || 'N/A'}</p>
                    <p style="margin: 0 0 5px 0; color: #555555; font-size: 13px;"><strong>Service:</strong> ${consultation.service || 'N/A'}</p>
                    <p style="margin: 0; color: #555555; font-size: 13px;"><strong>Message:</strong> ${consultation.message || 'N/A'}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; color: #333333; font-size: 14px;">Please log in to the admin dashboard to review and take action on this request.</p>
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

// GET /api/consultations/
router.get('/', auth, async (req, res) => {
  try {
    let consultations;

    if (req.user.role === 'client') {
      // Clients see only their own consultations
      consultations = await Consultation.find({ email: req.user.email }).sort({ submitted_at: -1 });
    } else {
      // Admin/Manager see all
      consultations = await Consultation.find().sort({ submitted_at: -1 });
    }

    return res.status(200).json({ success: true, consultations });
  } catch (error) {
    console.error('Get consultations error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching consultations' });
  }
});

// GET /api/consultations/search
router.get('/search', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const regex = new RegExp(query, 'i');

    const consultations = await Consultation.find({
      $or: [
        { first_name: regex },
        { last_name: regex },
        { email: regex },
        { phone: regex },
        { company_org: regex },
      ],
    }).sort({ submitted_at: -1 });

    return res.status(200).json({ success: true, consultations });
  } catch (error) {
    console.error('Search consultations error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error searching consultations' });
  }
});

// GET /api/consultations/export
router.get('/export', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ submitted_at: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Consultations');

    // Define columns
    worksheet.columns = [
      { header: 'First Name', key: 'first_name', width: 20 },
      { header: 'Last Name', key: 'last_name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Subject', key: 'subject', width: 25 },
      { header: 'Company', key: 'company_org', width: 25 },
      { header: 'Service', key: 'service', width: 25 },
      { header: 'Message', key: 'message', width: 50 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A365D' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Add header borders
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });

    // Add data rows
    consultations.forEach((c) => {
      const row = worksheet.addRow({
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone || '',
        subject: c.subject || '',
        company_org: c.company_org || '',
        service: c.service || '',
        message: c.message || '',
      });

      // Style data rows with borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=consultations.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export consultations error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error exporting consultations' });
  }
});

// GET /api/consultations/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Clients can only see their own consultations
    if (req.user.role === 'client' && consultation.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, consultation });
  } catch (error) {
    console.error('Get consultation error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching consultation' });
  }
});

// POST /api/consultations/ (public - book consultation)
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, companyOrg, subject, service, message } = req.body;

    const consultation = new Consultation({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone || '',
      company_org: companyOrg || '',
      subject: subject || '',
      service: service || '',
      message: message || '',
    });

    await consultation.save();

    // Send confirmation email to user
    try {
      await transporter.sendMail({
        from: `"HOBUCO Consulting" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Consultation Request Has Been Received - HOBUCO Consulting',
        html: getConfirmationEmailHTML(firstName, lastName, subject, service),
      });
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError.message);
    }

    // Send notification email to admin
    try {
      const admins = await User.find({ role: { $in: ['admin', 'manager'] } }).select('email');
      const adminEmails = admins.map((a) => a.email);

      if (adminEmails.length > 0) {
        await transporter.sendMail({
          from: `"HOBUCO Consulting" <${process.env.EMAIL_USER}>`,
          to: adminEmails.join(', '),
          subject: 'New Consultation Request Received - HOBUCO Consulting',
          html: getAdminNotificationEmailHTML(consultation),
        });
      }
    } catch (emailError) {
      console.error('Admin notification email failed:', emailError.message);
    }

    // Check if user is authenticated admin/manager
    try {
      const authHeader = req.headers.authorization;
      let token;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      if (token) {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && (user.role === 'admin' || user.role === 'manager')) {
          return res.status(201).json({ success: true, redirectUrl: '/consultations' });
        }
      }
    } catch (e) {
      // Not authenticated or invalid token, continue
    }

    return res.status(201).json({ success: true, message: 'Consultation request submitted' });
  } catch (error) {
    console.error('Book consultation error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error submitting consultation' });
  }
});

// POST /api/consultations/update/:id
router.post('/update/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Clients can only update their own consultations
    if (req.user.role === 'client' && consultation.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Build update object with only changed fields
    const updateFields = {};
    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      companyOrg: 'company_org',
      subject: 'subject',
      service: 'service',
      message: 'message',
    };

    let hasChanges = false;
    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (req.body[key] !== undefined && req.body[key] !== consultation[dbField]) {
        updateFields[dbField] = req.body[key];
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return res.status(200).json({ success: false, message: 'No changes detected' });
    }

    await Consultation.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    return res.status(200).json({ success: true, message: 'Consultation updated successfully' });
  } catch (error) {
    console.error('Update consultation error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating consultation' });
  }
});

// DELETE /api/consultations/delete/:id
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Clients can only delete their own consultations
    if (req.user.role === 'client' && consultation.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Consultation.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: 'Consultation deleted successfully' });
  } catch (error) {
    console.error('Delete consultation error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error deleting consultation' });
  }
});

module.exports = router;
