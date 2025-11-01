const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const ownerRoutes = require('./routes/ownerRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const violationRoutes = require('./routes/violationRoutes');
const violationTypeRoutes = require('./routes/violationTypeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const suspensionRoutes = require('./routes/suspensionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Use routes
app.use('/api/owners', ownerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/violation-types', violationTypeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/suspensions', suspensionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Traffic Violation Detection & Penalty System API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
});
