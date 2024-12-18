import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UnifiedFormComponent from './UnifiedFormComponent';

export default function BookReviewFormB() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const projectCode = searchParams.get('projectCode');
  const projectName = searchParams.get('projectName');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Supervisor' && user.role !== 'Admin') {
      navigate('/');
    }
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
      name: 'evaluatorName',
      label: 'Evaluator Name',
      type: 'text',
      disabled: true,
      defaultValue: user?.fullName || '',
    },
    {
      name: 'researchProcessScore',
      label: 'Research / Engineering Process',
      type: 'number',
      required: true,
      description:
        'Description of the research / engineering development process that was carried out, the various work stages, various constraints, description of the tests.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'researchProcessComments',
      label: 'Comments on the research process',
      type: 'textarea',
      required: true,
    },
    {
      name: 'workAnalysisScore',
      label: 'Work analysis and conclusion',
      type: 'number',
      required: true,
      description:
        'Analysis of the project progress, description of challenges and decisions. Summary, conclusions and insights.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'workAnalysisComments',
      label: 'Comments on the analysis of the process',
      type: 'textarea',
      required: true,
    },
    {
      name: 'softwareQualityScore',
      label: 'Quality of the software',
      type: 'number',
      required: true,
      description: 'The quality of the writing, documentation, and operation of the system.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'softwareQualityComments',
      label: 'Comments on the quality of writing',
      type: 'textarea',
      required: true,
    },
    {
      name: 'userGuidesScore',
      label: 'User and application guides',
      type: 'number',
      required: true,
      description:
        'Quality of information in user manuals and maintenance files. Description of the software structure, flow, and interfaces.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'userGuidesComments',
      label: 'Comments on the maintenance file',
      type: 'textarea',
      required: true,
    },
    {
      name: 'organizationScore',
      label: 'Organization and clarity',
      type: 'number',
      required: true,
      description:
        'Organization of the document: structure, logical flow, linking components, and clarity. Use of diagrams and accurate wording.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'organizationComments',
      label: 'Comments on the organization of the document',
      type: 'textarea',
      required: true,
    },
    {
      name: 'generalEvaluationScore',
      label: 'General evaluation',
      type: 'number',
      required: true,
      description: 'General impression, difficulty, and scope of the project, with a unique approach.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'overallScore',
      label: 'Overall Grade',
      type: 'number',
      required: true,
      description: 'Overall score for the project book.',
      placeholder: 'Score 0-100',
    },
    {
      name: 'additionalComments',
      label: 'Additional comments',
      type: 'textarea',
    },
  ];

  return (
    <UnifiedFormComponent
      formTitle="Book Review - Step B"
      formDescription={`This is an evaluation form for the final book review of the Part B project report. It assesses the complete project documentation, including research process, analysis, and software quality.`}
      formFields={formFields}
      submitEndpoint="bookReviewFormB"
    />
  );
}
