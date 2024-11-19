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
import Feedbackform from './pages/Feedbackform'; // Feedback form
import NotFound from './pages/NotFound'; // 404 Page

// Component imports
import Navbar from './components/Navbar'; // Navigation bar

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Navbar />
      <Routes>
        {/* Basic Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/projectsSupervisors" element={<ProjectsSupervisors />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/supervisorsStatus" element={<Supervisors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/feedback" element={<Feedbackform />} />
        <Route path="/contact" element={<Contact />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
