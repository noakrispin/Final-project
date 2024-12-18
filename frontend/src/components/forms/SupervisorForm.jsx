import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UnifiedFormComponent from './UnifiedFormComponent';

export default function SupervisorForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectCode = searchParams.get('projectCode');
  const projectName = searchParams.get('projectName');
  const students = JSON.parse(searchParams.get('students') || '[]');

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'Supervisor' && user.role !== 'Admin') navigate('/');
  }, [user, navigate]);

  const formFields = [
    {
      name: 'projectCodeAndName',
      label: 'Project Code and Name',
      type: 'text',
      disabled: true,
      defaultValue: `${projectCode || ''}   ${projectName || ''}`,
    },
    {
      name: 'lecturerName',
      label: "Lecturer's Name",
      type: 'text',
      disabled: true,
      defaultValue: user?.fullName || '',
    },
    {
      name: 'analysisAndSolution',
      label: 'Analysis and solution formation',
      type: 'number',
      required: true,
      description:
        'Quality of the work process, use of original ideas, level of questions raised during the work.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'projectDeliverables',
      label: 'Quality of the project deliverables',
      type: 'number',
      required: true,
      description:
        'Quality of the book and project presentation: Description and analysis of the existing situation, review of challenges. Description of the problem and proposed solution, testing plan. Organization of information at a professional level - structure and order, proper focus and summaries, use of charts and graphics, headings and numbering.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'generalEvaluation',
      label: 'General Evaluation',
      type: 'number',
      required: true,
      description: 'General impression, difficulty and scope of the project, use of a special approach.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'overallScore',
      label: 'Overall Grade',
      type: 'number',
      required: true,
      
      placeholder: 'Score 0-100',
    },
    {
      name: 'additionalComments',
      label: 'Additional Comments',
      type: 'textarea',
      required: true,
    },
  ];

  const studentQuestions = [
    {
      name: 'IndependentLearning',
      label: 'Capability of independent learning',
      type: 'number',
      required: true,
      description: 'Ability to learn independently, degree of independent progress.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'Teamwork',
      label: 'Teamwork',
      type: 'number',
      required: true,
      description: 'Collaboration, division of labor, dealing with difficulties.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'Attitude',
      label: 'Overall attitude towards the project',
      type: 'number',
      required: true,
      description: 'Creative approach, willingness to invest, pace of progress, meeting the time frame.',
      placeholder: 'Score 0-100',
    },
  ];

  return (
    <UnifiedFormComponent
      formTitle="Supervisor Evaluation Form"
      formDescription={`Intended to be filled out by the supervisor at the end of stage A or B.`}
      formFields={formFields}
      students={students}
      studentQuestions={studentQuestions}
      submitEndpoint="supervisorForm"
    />
  );
}
