import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UnifiedFormComponent from './UnifiedFormComponent';

export default function PresentationFormA() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const projectCode = searchParams.get('projectCode');
  const projectName = searchParams.get('projectName');
  const students = JSON.parse(searchParams.get('students') || '[]');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Supervisor' && user.role !== 'Admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // General Form Fields
  const formFields = [
    {
      name: 'projectCodeAndName',
      label: 'Project Code and Name',
      type: 'text',
      defaultValue: `${projectCode || ''}   ${projectName || ''}`,
      disabled: true,
    },
    {
      name: 'evaluatorName',
      label: 'Evaluator Name',
      type: 'text',
      defaultValue: user?.fullName || '',
      disabled: true,
    },
    {
      name: 'organizationScore',
      label: 'Organization of the presentation',
      type: 'number',
      required: true,
      description: 'Understandable and clear order of presenting the topics, presenting the material clearly, adhering to the time frame.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'organizationComments',
      label: 'Comments on organization',
      type: 'textarea',
      required: true,
    },
    {
      name: 'systemPresentationScore',
      label: 'Quality of the presentation of the system',
      type: 'number',
      required: true,
      description: 'Description of the background, need and solution. Quality of the software demonstration.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'systemPresentationComments',
      label: 'Comments on system presentation',
      type: 'textarea',
      required: true,
    },
    {
      name: 'projectReviewScore',
      label: 'Quality of the project review',
      type: 'number',
      required: true,
      description: 'Project summary, review of challenges, presentation of insights.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'projectReviewComments',
      label: 'Comments on project review',
      type: 'textarea',
      required: true,
    },
    {
      name: 'visibilityScore',
      label: 'Quality of the presentation visibility',
      type: 'number',
      required: true,
      description: 'Slides are easily read (size, color, and density), clarity of graphics presentation.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'visibilityComments',
      label: 'Comments on presentation visibility',
      type: 'textarea',
      required: true,
    },
    {
      name: 'overallScore',
      label: 'Overall Score',
      type: 'number',
      required: true,
      description: 'Overall score for the project presentation',
      placeholder: 'Score 0-100',
    },
    {
      name: 'additionalComments',
      label: 'Additional Comments',
      type: 'textarea',
    },
  ];

  // Student Evaluation Questions
  const studentQuestions = [
    {
      name: 'Knowledge',
      label: 'Level of knowledge and answering questions',
      type: 'number',
      required: true,
      placeholder: 'Score 0-100',
    },
    {
      name: 'PresentationSkills',
      label: 'Presentation skills',
      type: 'number',
      required: true,
      placeholder: 'Score 0-100',
    },
    {
      name: 'Comments',
      label: 'Comments on the student performance',
      type: 'textarea',
      required: true,
    },
  ];

  return (
    <UnifiedFormComponent
      formTitle="Presentation Evaluation - Step A"
      formDescription={`This is an evaluation form for the end of Part A project presentation. It assesses the organization, content, and visibility of the presentation, as well as individual student performance.`}
      formFields={formFields}
      submitEndpoint="presentationFormA"
      students={students}
      studentQuestions={studentQuestions}
    />
  );
}
