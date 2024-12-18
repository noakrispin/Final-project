import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UnifiedFormComponent from './UnifiedFormComponent';

export default function BookReviewFormA() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectCode = searchParams.get('projectCode');
  const projectName = searchParams.get('projectName');

  const formFields = [
    { 
      name: 'projectCodeAndName', 
      label: 'Project Code and Name', 
      type: 'text', 
      disabled: true, 
      defaultValue: `${projectCode || ''}   ${projectName || ''}` 
    },
    { 
      name: 'evaluatorName', 
      label: 'Evaluator Name', 
      type: 'text', 
      disabled: true, 
      defaultValue: user?.fullName || '' 
    },
    {
      name: 'introductionScore',
      label: 'Description of needs and project goals',
      type: 'number',
      required: true,
      description: 'Quality of the introduction: Description and analysis of the current situation, review of challenges. Description and definition of the problem and the proposed solution.',
      placeholder: 'Score 0-100',
      defaultValue: null,
    },
    { name: 'introductionComments', label: 'Comments on the quality of the introduction', type: 'textarea', required: true },
    {
      name: 'analysisScore',
      label: 'Analysis and solution formation',
      type: 'number',
      required: true,
      description: 'Analysis of the problem and description and the proposed solution. Use of quality sources.',
      placeholder: 'Score 0-100',
      defaultValue: null,
    },
    { name: 'analysisComments', label: 'Comments on the analysis of the problem', type: 'textarea', required: true },
    {
      name: 'processScore',
      label: 'Research / Engineering Process',
      type: 'number',
      required: true,
      description: 'Challenges in research / development. Description of the process stages, constraints, and solutions.',
      placeholder: 'Score 0-100',
      defaultValue: null,
    },
    { name: 'processComments', label: 'Comments on the description of the work process', type: 'textarea', required: true },
    {
      name: 'artifactsScore',
      label: 'Work Artifacts',
      type: 'number',
      required: true,
      description: 'Description of work products: algorithms, software system, user interface, testing plan.',
      placeholder: 'Score 0-100',
      defaultValue: null,
    },
    { name: 'artifactsComments', label: 'Comments on the work products', type: 'textarea', required: true },
    {
      name: 'organizationScore',
      label: 'Organization and clarity',
      type: 'number',
      required: true,
      description: 'Organization and clarity of the document, structure, logical flow, and diagrams.',
      placeholder: 'Score 0-100',
      defaultValue: null,
    },
    { name: 'organizationComments', label: 'Comments on the organization of the document', type: 'textarea', required: true },
    { name: 'languageComments', label: 'Comments on the language (syntax, spelling, writing style, etc.)', type: 'textarea', required: true },
    {
      name: 'generalEvaluationScore',
      label: 'General Evaluation',
      type: 'number',
      required: true,
      description: 'General impression, difficulty, and scope of the project.',
      placeholder: 'Score 0-100',
      defaultValue: null,
    },
    {
      name: 'overallScore',
      label: 'Overall Grade',
      type: 'number',
      required: true,
      description: 'Overall score for the project book.',
      placeholder: 'Score 0-100',
      defaultValue: null,
    },
    { name: 'additionalComments', label: 'Additional comments', type: 'textarea' },
  ];

  return (
    <UnifiedFormComponent
      formTitle="Book Review - Step A"
      formDescription="This is an evaluation form for the interim book review of the Part A project report. It assesses the initial chapters, including the project's background, objectives, and preliminary research."
      formFields={formFields}
      submitEndpoint="bookReviewFormA"
    />
  );
}
