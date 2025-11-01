const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all violation types
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT violation_type_id, description, fine_amount, points
      FROM violation_types
      ORDER BY description
    `);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching violation types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch violation types',
      message: error.message
    });
  }
});

// GET single violation type by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT violation_type_id, description, fine_amount, points
      FROM violation_types
      WHERE violation_type_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Violation type not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching violation type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch violation type',
      message: error.message
    });
  }
});

module.exports = router;
