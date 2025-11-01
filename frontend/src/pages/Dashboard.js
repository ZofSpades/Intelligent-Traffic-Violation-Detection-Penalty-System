import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Spinner, Table } from 'react-bootstrap';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="stats-card owners">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Owners</h6>
              <h2 className="mb-0">{stats?.totals.owners || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="stats-card vehicles">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Vehicles</h6>
              <h2 className="mb-0">{stats?.totals.vehicles || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="stats-card violations">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Violations</h6>
              <h2 className="mb-0">{stats?.totals.violations || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stats-card violations">
            <Card.Body>
              <h6 className="text-muted mb-2">Pending Violations</h6>
              <h3 className="mb-0 text-danger">{stats?.violations.pending || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stats-card violations">
            <Card.Body>
              <h6 className="text-muted mb-2">Paid Violations</h6>
              <h3 className="mb-0 text-success">{stats?.violations.paid || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stats-card payments">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Payments</h6>
              <h3 className="mb-0">${stats?.payments?.totalAmount ? Number(stats.payments.totalAmount).toFixed(2) : '0.00'}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stats-card suspensions">
            <Card.Body>
              <h6 className="text-muted mb-2">Active Suspensions</h6>
              <h3 className="mb-0">{stats?.suspensions.active || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Violations */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Recent Violations</h5>
        </Card.Header>
        <Card.Body>
          {stats?.recentViolations && stats.recentViolations.length > 0 ? (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Registration</th>
                  <th>Owner</th>
                  <th>Fine Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentViolations.map((violation) => (
                  <tr key={violation.violation_id}>
                    <td>{violation.violation_id}</td>
                    <td>{violation.violation_type}</td>
                    <td>{new Date(violation.violation_date).toLocaleDateString()}</td>
                    <td>{violation.registration_number}</td>
                    <td>{violation.owner_name}</td>
                    <td>${violation.fine_amount}</td>
                    <td>
                      <span className={`badge ${
                        violation.status === 'Paid' ? 'bg-success' : 'bg-warning'
                      }`}>
                        {violation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="empty-state">
              <h4>No Violations</h4>
              <p>No violations have been recorded yet.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
