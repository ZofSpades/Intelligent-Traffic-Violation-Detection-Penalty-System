import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, Spinner, Row, Col } from 'react-bootstrap';
import { paymentAPI, violationAPI } from '../../services/api';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    payment_id: '',
    violation_id: '',
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
  });
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const violationsRes = await violationAPI.getAll();
      
      if (violationsRes.data.success) {
        // Filter only unpaid violations
        const unpaidViolations = violationsRes.data.data.filter(v => v.status === 'Unpaid');
        setViolations(unpaidViolations);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load violations. Please refresh the page.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-fill amount when violation is selected
    if (name === 'violation_id') {
      const selectedViolation = violations.find(v => v.violation_id === parseInt(value));
      if (selectedViolation) {
        setFormData((prev) => ({
          ...prev,
          amount_paid: selectedViolation.fine_amount,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const dataToSubmit = {
        payment_id: formData.payment_id,
        violation_id: formData.violation_id,
        amount_paid: formData.amount_paid,
        payment_date: formData.payment_date,
      };

      await paymentAPI.create(dataToSubmit);
      navigate('/payments');
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to process payment'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Process Payment</h1>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {violations.length === 0 && !loading && (
        <Alert variant="info">
          No unpaid violations available for payment. All violations have been paid or no violations exist.
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Payment ID *</Form.Label>
              <Form.Control
                type="number"
                name="payment_id"
                value={formData.payment_id}
                onChange={handleChange}
                required
                placeholder="Enter unique payment ID"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a payment ID.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Violation *</Form.Label>
              <Form.Select
                name="violation_id"
                value={formData.violation_id}
                onChange={handleChange}
                required
              >
                <option value="">Select violation to pay</option>
                {violations.map((violation) => (
                  <option key={violation.violation_id} value={violation.violation_id}>
                    ID: {violation.violation_id} | {violation.violation_description} | 
                    ${violation.fine_amount} | Vehicle: {violation.registration_no} | 
                    Owner: {violation.owner_name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select a violation.
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount Paid * ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount_paid"
                    value={formData.amount_paid}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide an amount.
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Amount is auto-filled based on violation selected
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a payment date.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info">
              <strong>Note:</strong> When a payment is processed, the violation status will automatically be updated to "Paid". 
              If all violations for a license are paid, the license suspension will be automatically lifted by the database trigger.
            </Alert>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={loading || violations.length === 0}
              >
                {loading ? 'Processing...' : 'Process Payment'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/payments')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentForm;
