import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

// Page imports
import Home from "./pages/Home";
import ProjectsSupervisors from "./pages/ProjectsSupervisors";
import MyProjectsReview from "./pages/MyProjectsReview";
import OtherProjectsReview from "./pages/OtherProjectsReview";
import MyProfile from "./pages/MyProfile";
import Supervisors from "./pages/SupervisorsStatus";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import SignUp from "./pages/SignUp";
import EvaluationForms from "./pages/EvaluationForms";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminFileUpload from "./pages/admin/AdminFileUpload";
import AdminForms from "./pages/admin/AdminForms";
import AdminGrades from "./pages/admin/AdminGrades";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import SupervisorGradesFeedback from "./pages/SupervisorGradesFeedback";
import ForgotPassword from "./pages/ForgotPassword";
import UserManagement from "./pages/admin/UserManagement"
import AdminReminders from "./pages/admin/AdminReminders"


// Component imports
import Navbar from "./components/layout/Navbar";
import AdminNavbar from "./components/admin/AdminNavbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

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
        <Route path="/project/:projectId" element={<ProjectDetailsPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/projectsSupervisors"
          element={
            <ProtectedRoute allowedRoles={["Supervisor"]}>
              <ProjectsSupervisors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/MyProjectsReview"
          element={
            <ProtectedRoute allowedRoles={["Supervisor"]}>
              <MyProjectsReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/OtherProjectsReview"
          element={
            <ProtectedRoute allowedRoles={["Supervisor"]}>
              <OtherProjectsReview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute allowedRoles={[ "Supervisor"]}>
              <ProjectDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Supervisor"]}>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluation-forms/*"
          element={
            <ProtectedRoute adminOnly>
              <EvaluationForms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SupervisorGradesFeedback"
          element={
            <ProtectedRoute adminOnly>
              <SupervisorGradesFeedback />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-projects"
          element={
            <ProtectedRoute adminOnly>
              <AdminProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-upload"
          element={
            <ProtectedRoute adminOnly>
              <AdminFileUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-management"
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-forms"
          element={
            <ProtectedRoute adminOnly>
              <AdminForms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-grades"
          element={
            <ProtectedRoute hasAccess={["Admin"]}>
              <AdminGrades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-Reminders"
          element={
            <ProtectedRoute hasAccess={["Admin"]}>
              <AdminReminders />
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
