const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all licenses with owner information
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, o.name as owner_name 
      FROM licenses l 
      LEFT JOIN owners o ON l.owner_id = o.owner_id 
      ORDER BY l.license_id DESC
    `);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch licenses',
      message: error.message
    });
  }
});

// GET single license by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, o.name as owner_name 
      FROM licenses l 
      LEFT JOIN owners o ON l.owner_id = o.owner_id 
      WHERE l.license_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'License not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching license:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch license',
      message: error.message
    });
  }
});

// POST create new license
router.post('/', async (req, res) => {
  try {
    const { license_id, owner_id, issue_date, expiry_date, status } = req.body;

    // Validation
    if (!license_id || !owner_id || !issue_date || !expiry_date) {
      return res.status(400).json({
        success: false,
        error: 'license_id, owner_id, issue_date and expiry_date are required fields'
      });
    }

    const [result] = await db.query(
      'INSERT INTO licenses (license_id, owner_id, issue_date, expiry_date, status) VALUES (?, ?, ?, ?, ?)',
      [license_id, owner_id, issue_date, expiry_date, status || 'Active']
    );

    res.status(201).json({
      success: true,
      message: 'License created successfully',
      data: {
        license_id,
        owner_id,
        issue_date,
        expiry_date,
        status: status || 'Active'
      }
    });
  } catch (error) {
    console.error('Error creating license:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create license',
      message: error.message
    });
  }
});

// PUT update license
router.put('/:id', async (req, res) => {
  try {
    const { owner_id, issue_date, expiry_date, status } = req.body;
    const licenseId = req.params.id;

    // Check if license exists
    const [existing] = await db.query('SELECT * FROM licenses WHERE license_id = ?', [licenseId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'License not found'
      });
    }

    // Validation
    if (!owner_id || !issue_date || !expiry_date) {
      return res.status(400).json({
        success: false,
        error: 'owner_id, issue_date and expiry_date are required fields'
      });
    }

    await db.query(
      'UPDATE licenses SET owner_id = ?, issue_date = ?, expiry_date = ?, status = ? WHERE license_id = ?',
      [owner_id, issue_date, expiry_date, status || existing[0].status, licenseId]
    );

    res.json({
      success: true,
      message: 'License updated successfully',
      data: {
        license_id: licenseId,
        owner_id,
        issue_date,
        expiry_date,
        status: status || existing[0].status
      }
    });
  } catch (error) {
    console.error('Error updating license:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update license',
      message: error.message
    });
  }
});

// DELETE license
router.delete('/:id', async (req, res) => {
  try {
    const licenseId = req.params.id;

    // Check if license exists
    const [existing] = await db.query('SELECT * FROM licenses WHERE license_id = ?', [licenseId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'License not found'
      });
    }

    await db.query('DELETE FROM licenses WHERE license_id = ?', [licenseId]);

    res.json({
      success: true,
      message: 'License deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting license:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete license',
      message: error.message
    });
  }
});

module.exports = router;
