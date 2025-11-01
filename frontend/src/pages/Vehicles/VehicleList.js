import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { vehicleAPI } from '../../services/api';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getAll();
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch vehicles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    
    try {
      const response = await vehicleAPI.delete(selectedVehicle.vehicle_id);
      if (response.data.success) {
        setSuccess('Vehicle deleted successfully');
        fetchVehicles();
        setShowDeleteModal(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete vehicle: ' + (err.response?.data?.message || err.message));
      setShowDeleteModal(false);
      setTimeout(() => setError(''), 5000);
    }
  };

  const confirmDelete = (vehicle) => {
    setSelectedVehicle(vehicle);
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
        <h1 className="page-title">Vehicle Management</h1>
        <Button variant="primary" onClick={() => navigate('/vehicles/new')}>
          + Add New Vehicle
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
          {vehicles.length > 0 ? (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Registration Number</th>
                  <th>Vehicle Type</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.vehicle_id}>
                    <td>{vehicle.vehicle_id}</td>
                    <td><strong>{vehicle.registration_no}</strong></td>
                    <td>{vehicle.vehicle_type}</td>
                    <td>{vehicle.owner_name}</td>
                    <td>
                      <div className="table-actions">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => navigate(`/vehicles/edit/${vehicle.vehicle_id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmDelete(vehicle)}
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
              <h4>No Vehicles Found</h4>
              <p>Start by adding a new vehicle.</p>
              <Button variant="primary" onClick={() => navigate('/vehicles/new')}>
                Add First Vehicle
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
          Are you sure you want to delete vehicle "{selectedVehicle?.registration_no}"? This action cannot be undone.
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

export default VehicleList;
