import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Alert, Spinner, Card, Modal, Badge } from 'react-bootstrap';
import { violationAPI } from '../../services/api';

const ViolationList = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const response = await violationAPI.getAll();
      if (response.data.success) {
        setViolations(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch violations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedViolation) return;
    
    try {
      const response = await violationAPI.delete(selectedViolation.violation_id);
      if (response.data.success) {
        setSuccess('Violation deleted successfully');
        fetchViolations();
        setShowDeleteModal(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete violation: ' + (err.response?.data?.message || err.message));
      setShowDeleteModal(false);
      setTimeout(() => setError(''), 5000);
    }
  };

  const confirmDelete = (violation) => {
    setSelectedViolation(violation);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Unpaid': 'danger',
      'Paid': 'success',
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
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
        <h1 className="page-title">Violation Management</h1>
        <Button variant="primary" onClick={() => navigate('/violations/new')}>
          + Report New Violation
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

      <Card>
        <Card.Body>
          {violations.length > 0 ? (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Violation ID</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Vehicle</th>
                  <th>Owner</th>
                  <th>Fine Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {violations.map((violation) => (
                  <tr key={violation.violation_id}>
                    <td><strong>{violation.violation_id}</strong></td>
                    <td>{violation.violation_description || '-'}</td>
                    <td>{formatDate(violation.date_time)}</td>
                    <td>{violation.location}</td>
                    <td>{violation.registration_no}</td>
                    <td>{violation.owner_name}</td>
                    <td>${violation.fine_amount ? parseFloat(violation.fine_amount).toFixed(2) : '0.00'}</td>
                    <td>{getStatusBadge(violation.status)}</td>
                    <td>
                      <div className="table-actions">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => navigate(`/violations/edit/${violation.violation_id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmDelete(violation)}
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
              <h4>No Violations Found</h4>
              <p>Start by reporting a new violation.</p>
              <Button variant="primary" onClick={() => navigate('/violations/new')}>
                Report First Violation
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
          Are you sure you want to delete this violation? This action cannot be undone.
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

export default ViolationList;
