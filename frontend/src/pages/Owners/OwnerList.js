import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { ownerAPI } from '../../services/api';

const OwnerList = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getAll();
      if (response.data.success) {
        setOwners(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch owners');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOwner) return;
    
    try {
      const response = await ownerAPI.delete(selectedOwner.owner_id);
      if (response.data.success) {
        setSuccess('Owner deleted successfully');
        fetchOwners();
        setShowDeleteModal(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete owner: ' + (err.response?.data?.message || err.message));
      setShowDeleteModal(false);
      setTimeout(() => setError(''), 5000);
    }
  };

  const confirmDelete = (owner) => {
    setSelectedOwner(owner);
    setShowDeleteModal(true);
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
        <h1 className="page-title">Owner Management</h1>
        <Button variant="primary" onClick={() => navigate('/owners/new')}>
          + Add New Owner
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
          {owners.length > 0 ? (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <tr key={owner.owner_id}>
                    <td>{owner.owner_id}</td>
                    <td>{owner.name}</td>
                    <td>{owner.address}</td>
                    <td>{owner.phone}</td>
                    <td>
                      <div className="table-actions">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => navigate(`/owners/edit/${owner.owner_id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmDelete(owner)}
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
              <h4>No Owners Found</h4>
              <p>Start by adding a new owner.</p>
              <Button variant="primary" onClick={() => navigate('/owners/new')}>
                Add First Owner
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
          Are you sure you want to delete owner "{selectedOwner?.name}"? This action cannot be undone.
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

export default OwnerList;
