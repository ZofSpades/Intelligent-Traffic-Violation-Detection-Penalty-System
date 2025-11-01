const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all payments with related information
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, 
             v.violation_type_id,
             vt.description as violation_description,
             p.amount_paid as amount,
             o.name as owner_name
      FROM payments p
      LEFT JOIN violations v ON p.violation_id = v.violation_id
      LEFT JOIN violation_types vt ON v.violation_type_id = vt.violation_type_id
      LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id
      LEFT JOIN owners o ON veh.owner_id = o.owner_id
      ORDER BY p.payment_date DESC
    `);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments',
      message: error.message
    });
  }
});

// GET single payment by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, 
             v.violation_type_id,
             vt.description as violation_description,
             p.amount_paid as amount,
             o.name as owner_name
      FROM payments p
      LEFT JOIN violations v ON p.violation_id = v.violation_id
      LEFT JOIN violation_types vt ON v.violation_type_id = vt.violation_type_id
      LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id
      LEFT JOIN owners o ON veh.owner_id = o.owner_id
      WHERE p.payment_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment',
      message: error.message
    });
  }
});

// POST create new payment
router.post('/', async (req, res) => {
  try {
    const {
      payment_id,
      violation_id,
      amount_paid,
      payment_date
    } = req.body;

    // Validation
    if (!payment_id || !violation_id || amount_paid === undefined || !payment_date) {
      return res.status(400).json({
        success: false,
        error: 'payment_id, violation_id, amount_paid and payment_date are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO payments (payment_id, violation_id, amount_paid, payment_date) VALUES (?, ?, ?, ?)`,
      [payment_id, violation_id, amount_paid, payment_date]
    );

    // Update violation status to 'Paid'
    await db.query(
      'UPDATE violations SET status = ? WHERE violation_id = ?',
      ['Paid', violation_id]
    );

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment_id: payment_id,
        violation_id,
        amount_paid,
        payment_date
      }
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment',
      message: error.message
    });
  }
});

// PUT update payment
router.put('/:id', async (req, res) => {
  try {
    const { violation_id, amount_paid, payment_date } = req.body;
    const paymentId = req.params.id;

    // Check if payment exists
    const [existing] = await db.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    await db.query(
      `UPDATE payments SET violation_id = ?, amount_paid = ?, payment_date = ? WHERE payment_id = ?`,
      [violation_id || existing[0].violation_id, amount_paid || existing[0].amount_paid, payment_date || existing[0].payment_date, paymentId]
    );

    res.json({
      success: true,
      message: 'Payment updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment',
      message: error.message
    });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Check if payment exists
    const [existing] = await db.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    await db.query('DELETE FROM payments WHERE payment_id = ?', [paymentId]);

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete payment',
      message: error.message
    });
  }
});

module.exports = router;
