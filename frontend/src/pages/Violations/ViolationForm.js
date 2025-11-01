import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Alert, Card, Spinner, Row, Col } from 'react-bootstrap';
import { violationAPI, vehicleAPI, violationTypeAPI } from '../../services/api';

const ViolationForm = () => {
  const [formData, setFormData] = useState({
    violation_id: '',
    vehicle_id: '',
    violation_type_id: '',
    location: '',
    date_time: new Date().toISOString().slice(0, 16), // datetime-local format
    status: 'Unpaid',
  });
  const [vehicles, setVehicles] = useState([]);
  const [violationTypes, setViolationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  useEffect(() => {
    fetchData();
    if (isEditMode) {
      fetchViolation();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [vehiclesRes, violationTypesRes] = await Promise.all([
        vehicleAPI.getAll(),
        violationTypeAPI.getAll(),
      ]);
      
      if (vehiclesRes.data.success) setVehicles(vehiclesRes.data.data);
      if (violationTypesRes.data.success) setViolationTypes(violationTypesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load form data. Please refresh the page.');
    }
  };

  const fetchViolation = async () => {
    try {
      setLoading(true);
      const response = await violationAPI.getById(id);
      if (response.data.success) {
        const violation = response.data.data;
        setFormData({
          violation_id: violation.violation_id || '',
          vehicle_id: violation.vehicle_id || '',
          violation_type_id: violation.violation_type_id || '',
          location: violation.location || '',
          date_time: violation.date_time ? new Date(violation.date_time).toISOString().slice(0, 16) : '',
          status: violation.status || 'Unpaid',
        });
      }
    } catch (err) {
      setError('Failed to fetch violation details');
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
        violation_id: formData.violation_id,
        vehicle_id: formData.vehicle_id,
        violation_type_id: formData.violation_type_id,
        location: formData.location,
        date_time: formData.date_time,
        status: formData.status,
      };

      if (isEditMode) {
        await violationAPI.update(id, dataToSubmit);
      } else {
        await violationAPI.create(dataToSubmit);
      }

      navigate('/violations');
    } catch (err) {
      setError(
        err.response?.data?.error || 
        `Failed to ${isEditMode ? 'update' : 'create'} violation`
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
        <h1 className="page-title">{isEditMode ? 'Edit Violation' : 'Report New Violation'}</h1>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {!isEditMode && (
              <Form.Group className="mb-3">
                <Form.Label>Violation ID *</Form.Label>
                <Form.Control
                  type="number"
                  name="violation_id"
                  value={formData.violation_id}
                  onChange={handleChange}
                  required
                  placeholder="Enter unique violation ID"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a violation ID.
                </Form.Control.Feedback>
              </Form.Group>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle *</Form.Label>
                  <Form.Select
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                        {vehicle.registration_no} - {vehicle.vehicle_type} (Owner: {vehicle.owner_name})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a vehicle.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Violation Type *</Form.Label>
                  <Form.Select
                    name="violation_type_id"
                    value={formData.violation_type_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select violation type</option>
                    {violationTypes.map((type) => (
                      <option key={type.violation_type_id} value={type.violation_type_id}>
                        {type.description} - ${type.fine_amount} ({type.points} points)
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a violation type.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Location *</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter violation location (e.g., MG Road Junction, Bangalore)"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a location.
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="date_time"
                    value={formData.date_time}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide date and time.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info">
              <strong>Note:</strong> The fine amount and points are automatically set based on the violation type selected. 
              When a violation is created, triggers will automatically handle license suspension if points exceed 12.
            </Alert>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Violation' : 'Report Violation'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/violations')}
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

export default ViolationForm;
