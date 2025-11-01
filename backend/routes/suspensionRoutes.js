const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all suspensions with related information
router.get('/', async (req, res) => {
  try {
    const [licenses] = await db.query(`
      SELECT 
             l.license_id,
             l.issue_date,
             l.expiry_date,
             l.status,
             o.name as owner_name,
             fn_get_license_points(l.license_id) as total_points,
             CASE 
               WHEN fn_get_license_points(l.license_id) > 12 THEN 'Suspended'
               ELSE 'Active'
             END as suspension_status
      FROM licenses l
      LEFT JOIN owners o ON l.owner_id = o.owner_id
      ORDER BY total_points DESC, o.name
    `);

    // Get all suspensions for each license
    const [suspensions] = await db.query(`
      SELECT suspension_id, license_id, start_date, end_date, reason
      FROM suspensions
      ORDER BY license_id, start_date DESC
    `);

    // Group suspensions by license_id
    const suspensionsByLicense = {};
    suspensions.forEach(susp => {
      if (!suspensionsByLicense[susp.license_id]) {
        suspensionsByLicense[susp.license_id] = [];
      }
      suspensionsByLicense[susp.license_id].push({
        suspension_id: susp.suspension_id,
        start_date: susp.start_date,
        end_date: susp.end_date,
        reason: susp.reason
      });
    });

    // Attach suspensions to licenses
    const result = licenses.map(license => ({
      ...license,
      suspensions: suspensionsByLicense[license.license_id] || []
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching suspensions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suspensions',
      message: error.message
    });
  }
});

// GET single suspension by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, l.*, o.name as owner_name
      FROM suspensions s
      LEFT JOIN licenses l ON s.license_id = l.license_id
      LEFT JOIN owners o ON l.owner_id = o.owner_id
      WHERE s.suspension_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Suspension not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching suspension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suspension',
      message: error.message
    });
  }
});

// POST create new suspension
router.post('/', async (req, res) => {
  try {
    const { suspension_id, license_id, start_date, end_date, reason } = req.body;

    // Validation
    if (!suspension_id || !license_id || !start_date || !end_date || !reason) {
      return res.status(400).json({
        success: false,
        error: 'suspension_id, license_id, start_date, end_date and reason are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO suspensions (suspension_id, license_id, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)`,
      [suspension_id, license_id, start_date, end_date, reason]
    );

    res.status(201).json({
      success: true,
      message: 'Suspension created successfully',
      data: {
        suspension_id,
        license_id,
        start_date,
        end_date,
        reason
      }
    });
  } catch (error) {
    console.error('Error creating suspension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create suspension',
      message: error.message
    });
  }
});

// PUT update suspension
router.put('/:id', async (req, res) => {
  try {
    const { license_id, start_date, end_date, reason } = req.body;
    const suspensionId = req.params.id;

    // Check if suspension exists
    const [existing] = await db.query('SELECT * FROM suspensions WHERE suspension_id = ?', [suspensionId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Suspension not found'
      });
    }

    await db.query(
      `UPDATE suspensions SET license_id = ?, start_date = ?, end_date = ?, reason = ? WHERE suspension_id = ?`,
      [license_id || existing[0].license_id, start_date || existing[0].start_date, end_date || existing[0].end_date, reason || existing[0].reason, suspensionId]
    );

    res.json({
      success: true,
      message: 'Suspension updated successfully'
    });
  } catch (error) {
    console.error('Error updating suspension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update suspension',
      message: error.message
    });
  }
});

// DELETE suspension
router.delete('/:id', async (req, res) => {
  try {
    const suspensionId = req.params.id;

    // Check if suspension exists
    const [existing] = await db.query('SELECT * FROM suspensions WHERE suspension_id = ?', [suspensionId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Suspension not found'
      });
    }

    await db.query('DELETE FROM suspensions WHERE suspension_id = ?', [suspensionId]);

    res.json({
      success: true,
      message: 'Suspension deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting suspension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete suspension',
      message: error.message
    });
  }
});

module.exports = router;
