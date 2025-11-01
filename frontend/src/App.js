import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import pages
import Dashboard from './pages/Dashboard';
import OwnerList from './pages/Owners/OwnerList';
import OwnerForm from './pages/Owners/OwnerForm';
import VehicleList from './pages/Vehicles/VehicleList';
import VehicleForm from './pages/Vehicles/VehicleForm';
import ViolationList from './pages/Violations/ViolationList';
import ViolationForm from './pages/Violations/ViolationForm';
import PaymentList from './pages/Payments/PaymentList';
import PaymentForm from './pages/Payments/PaymentForm';
import SuspensionList from './pages/Suspensions/SuspensionList';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand as={Link} to="/">
              🚦 Traffic Violation System
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/owners">Owners</Nav.Link>
                <Nav.Link as={Link} to="/vehicles">Vehicles</Nav.Link>
                <Nav.Link as={Link} to="/violations">Violations</Nav.Link>
                <Nav.Link as={Link} to="/payments">Payments</Nav.Link>
                <Nav.Link as={Link} to="/suspensions">Suspensions</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/owners" element={<OwnerList />} />
            <Route path="/owners/new" element={<OwnerForm />} />
            <Route path="/owners/edit/:id" element={<OwnerForm />} />
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/new" element={<VehicleForm />} />
            <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
            <Route path="/violations" element={<ViolationList />} />
            <Route path="/violations/new" element={<ViolationForm />} />
            <Route path="/violations/edit/:id" element={<ViolationForm />} />
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/payments/new" element={<PaymentForm />} />
            <Route path="/suspensions" element={<SuspensionList />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
