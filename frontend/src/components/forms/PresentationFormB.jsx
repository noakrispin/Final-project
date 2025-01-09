import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UnifiedFormComponent from './UnifiedFormComponent';
import { mockApi } from '../../services/mockApi';

export default function PresentationFormB() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const projectCode = searchParams.get('projectCode');
  const projectName = searchParams.get('projectName');
  const students = JSON.parse(searchParams.get('students') || '[]');

  const [formFields, setFormFields] = useState([]);
  const [studentQuestions, setStudentQuestions] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Supervisor' && user.role !== 'Admin') {
      navigate('/');
    } else {
      mockApi.getQuestions('PresentationFormB').then((questions) => {
        setFormFields(questions.filter(q => !q.name.startsWith('student')));
        setStudentQuestions(questions.filter(q => q.name.startsWith('student')));
      });
    }
  }, [user, navigate]);

  return (
    <UnifiedFormComponent
      formTitle="Presentation Evaluation - Step B"
      formDescription="This is an evaluation form for the end of Part B project presentation. It assesses the organization, content, and visibility of the presentation, as well as individual student performance."
      formFields={formFields}
      submitEndpoint="presentationFormB"
      students={students}
      studentQuestions={studentQuestions}
      projectCode={projectCode}
      projectName={projectName}
    />
  );
}
