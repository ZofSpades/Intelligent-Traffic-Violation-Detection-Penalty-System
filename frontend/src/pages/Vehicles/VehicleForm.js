import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { vehicleAPI, ownerAPI } from '../../services/api';

const VehicleForm = () => {
  const [formData, setFormData] = useState({
    registration_no: '',
    vehicle_type: '',
    owner_id: ''
  });
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  useEffect(() => {
    fetchOwners();
    if (isEditMode) {
      fetchVehicle();
    }
  }, [id]);

  const fetchOwners = async () => {
    try {
      const response = await ownerAPI.getAll();
      if (response.data.success) {
        setOwners(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch owners:', err);
    }
  };

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getById(id);
      if (response.data.success) {
        const vehicle = response.data.data;
        setFormData({
          registration_no: vehicle.registration_no || '',
          vehicle_type: vehicle.vehicle_type || '',
          owner_id: vehicle.owner_id || ''
        });
      }
    } catch (err) {
      setError('Failed to fetch vehicle details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        registration_no: formData.registration_no,
        vehicle_type: formData.vehicle_type,
        owner_id: formData.owner_id
      };

      if (isEditMode) {
        await vehicleAPI.update(id, dataToSubmit);
      } else {
        await vehicleAPI.create(dataToSubmit);
      }

      navigate('/vehicles');
    } catch (err) {
      setError(
        err.response?.data?.error || 
        `Failed to ${isEditMode ? 'update' : 'create'} vehicle`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Registration Number *</Form.Label>
              <Form.Control
                type="text"
                name="registration_no"
                value={formData.registration_no}
                onChange={handleChange}
                required
                placeholder="e.g., KA01AB1234"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a registration number.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vehicle Type *</Form.Label>
              <Form.Select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                required
              >
                <option value="">Select vehicle type</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Truck">Truck</option>
                <option value="Bus">Bus</option>
                <option value="Auto">Auto Rickshaw</option>
                <option value="Other">Other</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select a vehicle type.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Owner *</Form.Label>
              <Form.Select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                required
              >
                <option value="">Select an owner</option>
                {owners.map((owner) => (
                  <option key={owner.owner_id} value={owner.owner_id}>
                    {owner.name} - {owner.phone}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select an owner.
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/vehicles')}
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

export default VehicleForm;
