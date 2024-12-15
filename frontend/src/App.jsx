import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Page imports
import Home from './pages/Home';
import ProjectsSupervisors from './pages/ProjectsSupervisors';
import MyProfile from './pages/MyProfile';
import Supervisors from './pages/SupervisorsStatus';
import Login from './pages/Login';
import Contact from './pages/Contact';
import SignUp from './pages/SignUp';
import EvaluationForms from './pages/EvaluationForm';
import NotFound from './pages/NotFound';

// Component imports
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <div className="mx-4 sm:mx-[10%]">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected Routes */}
          <Route
            path="/projectsSupervisors"
            element={
              <ProtectedRoute allowedRoles={['lecturer', 'admin']}>
                <ProjectsSupervisors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/MyProfile"
            element={
              <ProtectedRoute allowedRoles={['student', 'lecturer', 'admin']}>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisorsStatus"
            element={
              <ProtectedRoute allowedRoles={['lecturer', 'admin']}>
                <Supervisors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluation-forms"
            element={
              <ProtectedRoute allowedRoles={['lecturer', 'admin']}>
                <EvaluationForms />
              </ProtectedRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
