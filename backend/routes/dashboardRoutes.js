const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total owners
    const [ownerCount] = await db.query('SELECT COUNT(*) as count FROM owners');
    
    // Get total vehicles
    const [vehicleCount] = await db.query('SELECT COUNT(*) as count FROM vehicles');
    
    // Get total violations
    const [violationCount] = await db.query('SELECT COUNT(*) as count FROM violations');
    
    // Get total pending violations
    const [pendingViolations] = await db.query(
      "SELECT COUNT(*) as count FROM violations WHERE status = ?",
      ['Unpaid']
    );
    
    // Get total paid violations
    const [paidViolations] = await db.query(
      "SELECT COUNT(*) as count FROM violations WHERE status = ?",
      ['Paid']
    );
    
    // Get total payments
    const [paymentCount] = await db.query('SELECT COUNT(*) as count FROM payments');
    
    // Get total payment amount
    const [totalPayments] = await db.query('SELECT SUM(amount_paid) as total FROM payments');
    
    // Get total suspended licenses
    const [suspensionCount] = await db.query('SELECT COUNT(*) as count FROM suspensions');
    
    // Get active suspensions (no reinstatement date or future date)
    const [activeSuspensions] = await db.query(
      "SELECT COUNT(*) as count FROM suspensions WHERE end_date IS NULL OR end_date > CURDATE()"
    );
    
    // Get recent violations (last 10)
    const [recentViolations] = await db.query(`
      SELECT v.violation_id, vt.description AS violation_type, v.date_time AS violation_date, vt.fine_amount, v.status,
             veh.registration_no AS registration_number, o.name as owner_name
      FROM violations v
      LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id
      LEFT JOIN violation_types vt ON v.violation_type_id = vt.violation_type_id
      LEFT JOIN owners o ON veh.owner_id = o.owner_id
      ORDER BY v.date_time DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        totals: {
          owners: ownerCount[0].count,
          vehicles: vehicleCount[0].count,
          violations: violationCount[0].count,
          payments: paymentCount[0].count,
          suspensions: suspensionCount[0].count
        },
        violations: {
          pending: pendingViolations[0].count,
          paid: paidViolations[0].count
        },
        payments: {
          totalAmount: totalPayments[0].total || 0
        },
        suspensions: {
          active: activeSuspensions[0].count
        },
        recentViolations
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
});

module.exports = router;
