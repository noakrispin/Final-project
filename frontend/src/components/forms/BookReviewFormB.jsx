import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UnifiedFormComponent from './UnifiedFormComponent';
import { mockApi } from '../../services/mockApi';

export default function BookReviewFormB() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const projectCode = searchParams.get('projectCode');
  const projectName = searchParams.get('projectName');

  const [formFields, setFormFields] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Supervisor' && user.role !== 'Admin') {
      navigate('/');
    } else {
      mockApi.getQuestions('bookReviewerFormB').then(setFormFields);
    }
  }, [user, navigate]);

  return (
    <UnifiedFormComponent
      formTitle="Book Review - Step B"
      formDescription="This is an evaluation form for the final book review of the Part B project report. It assesses the complete project documentation, including research process, analysis, and software quality."
      formFields={formFields}
      submitEndpoint="bookReviewFormB"
      projectCode={projectCode}
      projectName={projectName}
    />
  );
}
