import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UnifiedFormComponent from './UnifiedFormComponent';
import { api } from '../../services/api';

export default function BookReviewFormA() {
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
      api.getQuestions('bookReviewerFormA').then(setFormFields);
    }
  }, [user, navigate]);

  return (
    <UnifiedFormComponent
      formTitle="Book Review - Step A"
      formDescription="This is an evaluation form for the interim book review of the Part A project report. It assesses the initial chapters, including the project's background, objectives, and preliminary research."
      formFields={formFields}
      submitEndpoint="bookReviewFormA"
      projectCode={projectCode}
      projectName={projectName}
    />
  );
}
