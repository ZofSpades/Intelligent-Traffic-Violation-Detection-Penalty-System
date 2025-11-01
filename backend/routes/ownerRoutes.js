const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all owners
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM owners ORDER BY owner_id DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch owners',
      message: error.message
    });
  }
});

// GET single owner by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM owners WHERE owner_id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Owner not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching owner:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch owner',
      message: error.message
    });
  }
});

// POST create new owner
router.post('/', async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    // Validation
    if (!name || !address || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, address, and phone are required fields'
      });
    }

    const [result] = await db.query(
      'INSERT INTO owners (name, address, phone) VALUES (?, ?, ?)',
      [name, address, phone]
    );

    res.status(201).json({
      success: true,
      message: 'Owner created successfully',
      data: {
        owner_id: result.insertId,
        name,
        address,
        phone
      }
    });
  } catch (error) {
    console.error('Error creating owner:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create owner',
      message: error.message
    });
  }
});

// PUT update owner
router.put('/:id', async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const ownerId = req.params.id;

    // Check if owner exists
    const [existing] = await db.query('SELECT * FROM owners WHERE owner_id = ?', [ownerId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Owner not found'
      });
    }

    // Validation
    if (!name || !address || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, address, and phone are required fields'
      });
    }

    await db.query(
      'UPDATE owners SET name = ?, address = ?, phone = ? WHERE owner_id = ?',
      [name, address, phone, ownerId]
    );

    res.json({
      success: true,
      message: 'Owner updated successfully',
      data: {
        owner_id: ownerId,
        name,
        address,
        phone
      }
    });
  } catch (error) {
    console.error('Error updating owner:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update owner',
      message: error.message
    });
  }
});

// DELETE owner
router.delete('/:id', async (req, res) => {
  try {
    const ownerId = req.params.id;

    // Check if owner exists
    const [existing] = await db.query('SELECT * FROM owners WHERE owner_id = ?', [ownerId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Owner not found'
      });
    }

    await db.query('DELETE FROM owners WHERE owner_id = ?', [ownerId]);

    res.json({
      success: true,
      message: 'Owner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting owner:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete owner',
      message: error.message
    });
  }
});

module.exports = router;
