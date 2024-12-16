import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Page imports
import Home from './pages/Home';
import ProjectsSupervisors from './pages/ProjectsSupervisors';
import ProjectToReview from './pages/ProjectToReview';
import MyProfile from './pages/MyProfile';
import Supervisors from './pages/SupervisorsStatus';
import Login from './pages/Login';
import Contact from './pages/Contact';
import SignUp from './pages/SignUp';
import EvaluationForms from './pages/EvaluationForms';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Component imports
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <div className="w-full">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route 
            path="/projectsSupervisors" 
            element={
              <ProtectedRoute allowedRoles={["Supervisor", "Admin"]}>
                <ProjectsSupervisors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ProjectToReview" 
            element={
              <ProtectedRoute allowedRoles={["Supervisor", "Admin"]}>
                <ProjectToReview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={["Student", "Supervisor", "Admin"]}>
                <MyProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/supervisorsStatus" 
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <Supervisors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/evaluation-forms/*" 
            element={
              <ProtectedRoute allowedRoles={["Supervisor", "Admin"]}>
                <EvaluationForms />
              </ProtectedRoute>
            } 
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

