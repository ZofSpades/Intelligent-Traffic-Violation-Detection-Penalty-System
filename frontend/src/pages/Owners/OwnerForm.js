import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { ownerAPI } from '../../services/api';

const OwnerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchOwner();
    }
  }, [id]);

  const fetchOwner = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getById(id);
      if (response.data.success) {
        const owner = response.data.data;
        setFormData({
          name: owner.name || '',
          address: owner.address || '',
          phone: owner.phone || ''
        });
      }
    } catch (err) {
      setError('Failed to fetch owner details');
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
        name: formData.name,
        address: formData.address,
        phone: formData.phone
      };

      if (isEditMode) {
        await ownerAPI.update(id, dataToSubmit);
      } else {
        await ownerAPI.create(dataToSubmit);
      }

      navigate('/owners');
    } catch (err) {
      setError(
        err.response?.data?.error || 
        `Failed to ${isEditMode ? 'update' : 'create'} owner`
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
        <h1 className="page-title">{isEditMode ? 'Edit Owner' : 'Add New Owner'}</h1>
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
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter owner's full name"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a name.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter complete address"
              />
              <Form.Control.Feedback type="invalid">
                Please provide an address.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone *</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a phone number.
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Owner' : 'Create Owner'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/owners')}
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

export default OwnerForm;
