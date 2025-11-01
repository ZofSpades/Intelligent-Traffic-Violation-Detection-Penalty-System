const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all violations with related information
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, 
             veh.registration_no, 
             vt.description AS violation_description,
             vt.fine_amount,
             o.name as owner_name
      FROM violations v
      LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id
      LEFT JOIN violation_types vt ON v.violation_type_id = vt.violation_type_id
      LEFT JOIN vehicles veh2 ON v.vehicle_id = veh2.vehicle_id
      LEFT JOIN owners o ON veh.owner_id = o.owner_id
      ORDER BY v.date_time DESC
    `);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch violations',
      message: error.message
    });
  }
});

// GET single violation by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, 
             veh.registration_no, 
             vt.description AS violation_description,
             vt.fine_amount,
             o.name as owner_name
      FROM violations v
      LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id
      LEFT JOIN violation_types vt ON v.violation_type_id = vt.violation_type_id
      LEFT JOIN owners o ON veh.owner_id = o.owner_id
      WHERE v.violation_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Violation not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching violation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch violation',
      message: error.message
    });
  }
});

// POST create new violation
router.post('/', async (req, res) => {
  try {
    const {
      violation_id,
      vehicle_id,
      violation_type_id,
      location,
      date_time,
      status
    } = req.body;

    // Validation
    if (!violation_id || !vehicle_id || !location || !date_time) {
      return res.status(400).json({
        success: false,
        error: 'violation_id, vehicle_id, location and date_time are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO violations (violation_id, vehicle_id, violation_type_id, location, date_time, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [violation_id, vehicle_id, violation_type_id || null, location, date_time, status || 'Unpaid']
    );

    res.status(201).json({
      success: true,
      message: 'Violation created successfully',
      data: {
        violation_id: violation_id,
        vehicle_id,
        violation_type_id,
        location,
        date_time,
        status: status || 'Unpaid'
      }
    });
  } catch (error) {
    console.error('Error creating violation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create violation',
      message: error.message
    });
  }
});

// PUT update violation
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicle_id,
      violation_type_id,
      location,
      date_time,
      status
    } = req.body;
    const violationId = req.params.id;

    // Check if violation exists
    const [existing] = await db.query('SELECT * FROM violations WHERE violation_id = ?', [violationId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Violation not found'
      });
    }

    await db.query(
      `UPDATE violations SET vehicle_id = ?, violation_type_id = ?, location = ?, date_time = ?, status = ? WHERE violation_id = ?`,
      [vehicle_id || existing[0].vehicle_id, violation_type_id || existing[0].violation_type_id, location || existing[0].location, date_time || existing[0].date_time, status || existing[0].status, violationId]
    );

    res.json({
      success: true,
      message: 'Violation updated successfully'
    });
  } catch (error) {
    console.error('Error updating violation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update violation',
      message: error.message
    });
  }
});

// DELETE violation
router.delete('/:id', async (req, res) => {
  try {
    const violationId = req.params.id;

    // Check if violation exists
    const [existing] = await db.query('SELECT * FROM violations WHERE violation_id = ?', [violationId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Violation not found'
      });
    }

    await db.query('DELETE FROM violations WHERE violation_id = ?', [violationId]);

    res.json({
      success: true,
      message: 'Violation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting violation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete violation',
      message: error.message
    });
  }
});

module.exports = router;
