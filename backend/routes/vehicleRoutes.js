const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all vehicles with owner information
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, o.name as owner_name 
      FROM vehicles v 
      LEFT JOIN owners o ON v.owner_id = o.owner_id 
      ORDER BY v.vehicle_id DESC
    `);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicles',
      message: error.message
    });
  }
});

// GET single vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, o.name as owner_name 
      FROM vehicles v 
      LEFT JOIN owners o ON v.owner_id = o.owner_id 
      WHERE v.vehicle_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle',
      message: error.message
    });
  }
});

// POST create new vehicle
router.post('/', async (req, res) => {
  try {
    const { registration_no, vehicle_type, owner_id } = req.body;

    // Validation (adapted to existing schema)
    if (!registration_no || !vehicle_type || !owner_id) {
      return res.status(400).json({
        success: false,
        error: 'registration_no, vehicle_type, and owner_id are required fields'
      });
    }

    const [result] = await db.query(
      'INSERT INTO vehicles (registration_no, vehicle_type, owner_id) VALUES (?, ?, ?)',
      [registration_no, vehicle_type, owner_id]
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: {
        vehicle_id: result.insertId,
        registration_no,
        vehicle_type,
        owner_id
      }
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create vehicle',
      message: error.message
    });
  }
});

// PUT update vehicle
router.put('/:id', async (req, res) => {
  try {
    const { registration_no, vehicle_type, owner_id } = req.body;
    const vehicleId = req.params.id;

    // Check if vehicle exists
    const [existing] = await db.query('SELECT * FROM vehicles WHERE vehicle_id = ?', [vehicleId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Validation
    if (!registration_no || !vehicle_type || !owner_id) {
      return res.status(400).json({
        success: false,
        error: 'registration_no, vehicle_type, and owner_id are required fields'
      });
    }

    await db.query(
      'UPDATE vehicles SET registration_no = ?, vehicle_type = ?, owner_id = ? WHERE vehicle_id = ?',
      [registration_no, vehicle_type, owner_id, vehicleId]
    );

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: {
        vehicle_id: vehicleId,
        registration_no,
        vehicle_type,
        owner_id
      }
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update vehicle',
      message: error.message
    });
  }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicleId = req.params.id;

    // Check if vehicle exists
    const [existing] = await db.query('SELECT * FROM vehicles WHERE vehicle_id = ?', [vehicleId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    await db.query('DELETE FROM vehicles WHERE vehicle_id = ?', [vehicleId]);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle',
      message: error.message
    });
  }
});

module.exports = router;
