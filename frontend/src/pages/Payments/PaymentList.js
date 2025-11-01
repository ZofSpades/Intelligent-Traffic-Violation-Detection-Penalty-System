import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { paymentAPI } from '../../services/api';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getAll();
      if (response.data.success) {
        setPayments(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;
    
    try {
      const response = await paymentAPI.delete(selectedPayment.payment_id);
      if (response.data.success) {
        setSuccess('Payment deleted successfully');
        fetchPayments();
        setShowDeleteModal(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete payment: ' + (err.response?.data?.message || err.message));
      setShowDeleteModal(false);
      setTimeout(() => setError(''), 5000);
    }
  };

  const confirmDelete = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const calculateTotal = () => {
    return payments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0).toFixed(2);
  };

  // Format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payment Management</h1>
        <Button variant="primary" onClick={() => navigate('/payments/new')}>
          + Add New Payment
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Body>
          <h5>Total Payments Collected: <span className="text-success">${calculateTotal()}</span></h5>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {payments.length > 0 ? (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Violation ID</th>
                  <th>Violation Type</th>
                  <th>Owner</th>
                  <th>Amount Paid</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td><strong>{payment.payment_id}</strong></td>
                    <td>{payment.violation_id}</td>
                    <td>{payment.violation_description || '-'}</td>
                    <td>{payment.owner_name}</td>
                    <td><strong>${payment.amount_paid ? parseFloat(payment.amount_paid).toFixed(2) : '0.00'}</strong></td>
                    <td>{formatDate(payment.payment_date)}</td>
                    <td>
                      <div className="table-actions">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmDelete(payment)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="empty-state">
              <h4>No Payments Found</h4>
              <p>Start by adding a new payment.</p>
              <Button variant="primary" onClick={() => navigate('/payments/new')}>
                Add First Payment
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this payment record? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentList;
