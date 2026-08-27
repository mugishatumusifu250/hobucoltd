const express = require('express');
const User = require('../models/User');
const { auth, roleCheck } = require('../middleware/auth');
const ExcelJS = require('exceljs');

const router = express.Router();

// GET /api/users/
router.get('/', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

// GET /api/users/search
router.get('/search', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const regex = new RegExp(query, 'i');

    const users = await User.find({
      $or: [
        { username: regex },
        { email: regex },
        { role: regex },
      ],
    })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Search users error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error searching users' });
  }
});

// GET /api/users/export/:role
router.get('/export/:role', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const { role } = req.params;

    let query = {};
    if (role !== 'all') {
      if (!['admin', 'manager', 'client'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role filter' });
      }
      query = { role };
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Define columns
    worksheet.columns = [
      { header: 'Username', key: 'username', width: 25 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Role', key: 'role', width: 15 },
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
    users.forEach((u) => {
      const row = worksheet.addRow({
        username: u.username,
        email: u.email,
        role: u.role,
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
    res.setHeader('Content-Disposition', `attachment; filename=users_${role}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export users error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error exporting users' });
  }
});

// GET /api/users/:id
router.get('/:id', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching user' });
  }
});

// POST /api/users/update/:id
router.post('/update/:id', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const { username, email, role, password } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if anything changed
    const updates = {};
    let hasChanges = false;

    if (username !== undefined && username !== user.username) {
      // Check if new username is already taken by another user
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      updates.username = username;
      hasChanges = true;
    }

    if (email !== undefined && email.toLowerCase().trim() !== user.email) {
      // Check if new email is already taken by another user
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      updates.email = email.toLowerCase().trim();
      hasChanges = true;
    }

    if (role !== undefined && role !== user.role) {
      if (!['admin', 'manager', 'client'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      updates.role = role;
      hasChanges = true;
    }

    if (password && password.trim() !== '') {
      updates.password = password;
      hasChanges = true;
    }

    if (!hasChanges) {
      return res.status(200).json({ success: false, message: 'Make a change to update' });
    }

    await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });

    return res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating user' });
  }
});

// DELETE /api/users/delete/:id
router.delete('/delete/:id', auth, roleCheck('admin', 'manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
});

module.exports = router;
