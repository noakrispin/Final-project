import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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
import AdminProjects from './pages/admin/AdminProjects';
import AdminFileUpload from './pages/admin/AdminFileUpload';

// Component imports
import Navbar from './components/layout/Navbar';
import AdminNavbar from './components/admin/AdminNavbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="w-full">
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
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
    
        {/* Admin Routes */}
        <Route 
          path="/admin-projects" 
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminProjects />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-upload" 
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminFileUpload />
            </ProtectedRoute>
          } 
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;

