import React, { useState, useEffect } from 'react';
import { Table, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { suspensionAPI } from '../../services/api';

const SuspensionList = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSuspensions();
  }, []);

  const fetchSuspensions = async () => {
    try {
      setLoading(true);
      const response = await suspensionAPI.getAll();
      if (response.data.success) {
        setLicenses(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch license suspension data');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <h1 className="page-title">License Suspensions</h1>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          {licenses.length > 0 ? (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>License ID</th>
                  <th>Owner</th>
                  <th>Issue Date</th>
                  <th>Expiry Date</th>
                  <th>Total Points</th>
                  <th>License Status</th>
                  <th>Suspension Status</th>
                  <th>Suspension Start</th>
                  <th>Suspension End</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((license) => {
                  const points = license.total_points || 0;
                  const isSuspended = points > 12;
                  const hasSuspensions = license.suspensions && license.suspensions.length > 0;
                  
                  return (
                    <tr key={license.license_id}>
                      <td><strong>{license.license_id}</strong></td>
                      <td>{license.owner_name}</td>
                      <td>{formatDate(license.issue_date)}</td>
                      <td>{formatDate(license.expiry_date)}</td>
                      <td>
                        <Badge bg={points > 12 ? 'danger' : points > 8 ? 'warning' : 'success'}>
                          {points} points
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={license.status === 'Suspended' ? 'danger' : 'success'}>
                          {license.status || 'Active'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={isSuspended ? 'danger' : 'success'}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </td>
                      <td>
                        {hasSuspensions ? (
                          <>
                            {license.suspensions.map((susp, idx) => (
                              <div key={susp.suspension_id || idx} style={{ 
                                padding: '4px 0',
                                borderBottom: idx < license.suspensions.length - 1 ? '1px solid #dee2e6' : 'none',
                                minHeight: '24px',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                {formatDate(susp.start_date)}
                              </div>
                            ))}
                          </>
                        ) : '-'}
                      </td>
                      <td>
                        {hasSuspensions ? (
                          <>
                            {license.suspensions.map((susp, idx) => (
                              <div key={susp.suspension_id || idx} style={{ 
                                padding: '4px 0',
                                borderBottom: idx < license.suspensions.length - 1 ? '1px solid #dee2e6' : 'none',
                                minHeight: '24px',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                {formatDate(susp.end_date)}
                              </div>
                            ))}
                          </>
                        ) : '-'}
                      </td>
                      <td>
                        {hasSuspensions ? (
                          <>
                            {license.suspensions.map((susp, idx) => (
                              <div key={susp.suspension_id || idx} style={{ 
                                padding: '4px 0',
                                borderBottom: idx < license.suspensions.length - 1 ? '1px solid #dee2e6' : 'none',
                                minHeight: '24px',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                {susp.reason}
                              </div>
                            ))}
                          </>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="empty-state">
              <h4>No License Data Found</h4>
              <p>No licenses have been recorded in the system.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Alert variant="info" className="mt-3">
        <strong>Suspension Rules:</strong>
        <ul className="mb-0 mt-2">
          <li><strong>Active:</strong> License with 12 or fewer violation points</li>
          <li><strong>Suspended:</strong> License with more than 12 violation points</li>
          <li>Points are automatically calculated from all violations associated with the owner's vehicles</li>
          <li>When violations are paid, points remain but suspension may be lifted if all fines are paid</li>
          <li>Multiple suspensions for the same owner are shown in a single row, one below another</li>
        </ul>
      </Alert>
    </div>
  );
};

export default SuspensionList;
