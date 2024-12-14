import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Page imports
import Home from './pages/Home';
import ProjectsSupervisors from './pages/ProjectsSupervisors'; // Dashboard for supervisors
import MyProfile from './pages/MyProfile'; // User profile page
import Supervisors from './pages/SupervisorsStatus'; // Supervisors' status overview
import Login from './pages/Login'; // Login page placeholder
import Contact from './pages/Contact'; // Contact page
import SignUp from './pages/SignUp'; // Registration page placeholder
import EvaluationForms from './pages/EvaluationForm'; // Feedback form
import NotFound from './pages/NotFound'; // 404 Page

// Component imports
import Navbar from './components/layout/Navbar'; // Navigation bar
import ProtectedRoute from './components/ProtectedRoute'; // ProtectedRoute component
import { AuthProvider } from './context/AuthContext'; // Auth Context

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
              <ProtectedRoute>
                <ProjectsSupervisors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisorsStatus"
            element={
              <ProtectedRoute>
                <Supervisors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluation-forms"
            element={
              <ProtectedRoute>
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
