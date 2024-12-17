import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import FormField from './FormField';
import { api } from '../../services/api';
import { Button } from '../ui/Button';

export default function BookReviewFormB() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectCode = searchParams.get('projectCode');
  const projectName = searchParams.get('projectName');

  const [formData, setFormData] = useState({
    projectCodeAndName: `${projectCode || ''} - ${projectName || ''}`,
    evaluatorName: '',
    researchProcessScore: '',
    researchProcessComments: '',
    workAnalysisScore: '',
    workAnalysisComments: '',
    softwareQualityScore: '',
    softwareQualityComments: '',
    userGuidesScore: '',
    userGuidesComments: '',
    organizationScore: '',
    organizationComments: '',
    generalEvaluationScore: '',
    additionalComments: '',
    overallScore: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Supervisor' && user.role !== 'Admin') {
      navigate('/');
    } else {
      setFormData(prevData => ({
        ...prevData,
        evaluatorName: user.fullName
      }));
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await api.submitForm('bookReviewFormB', formData);
      if (result.success) {
        console.log('Form submitted successfully');
        navigate('/ProjectToReview');
      } else {
        console.error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!user || (user.role !== 'Supervisor' && user.role !== 'Admin')) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Book Review - Step B</h2>
        <p className="text-gray-600">
          This is an evaluation form for the final book review of the Part B project report. It assesses the complete project documentation, including research process, analysis, and software quality.
        </p>
      </div>
      <FormField
        label="Project Code and Name"
        type="text"
        name="projectCodeAndName"
        value={formData.projectCodeAndName}
        onChange={handleChange}
        required={true}
        disabled={true}
      />
      <FormField
        label="Evaluator name"
        type="text"
        name="evaluatorName"
        value={formData.evaluatorName}
        onChange={handleChange}
        required={true}
        disabled={true}
      />
      <FormField
        label="Research / Engineering Process"
        type="number"
        name="researchProcessScore"
        value={formData.researchProcessScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Description of the research / engineering development process that was carried out, the various work stages, various (research / engineering) constraints that influenced the development process, description of the tests. (Score 0-100)"
      />
      <FormField
        label="Comments on the research process"
        type="textarea"
        name="researchProcessComments"
        value={formData.researchProcessComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Work analysis and conclusion"
        type="number"
        name="workAnalysisScore"
        value={formData.workAnalysisScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Analysis of the project progress, description of challenges and decisions. Summary, conclusions and insights (mistakes and successes, reference to the project data as described, without general or casual statements). (Score 0-100)"
      />
      <FormField
        label="Comments on the analysis of the process"
        type="textarea"
        name="workAnalysisComments"
        value={formData.workAnalysisComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Quality of the software"
        type="number"
        name="softwareQualityScore"
        value={formData.softwareQualityScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="The quality of the writing, documentation and operation of the system. (Score 0-100)"
      />
      <FormField
        label="Comments on the quality of writing"
        type="textarea"
        name="softwareQualityComments"
        value={formData.softwareQualityComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="User and application guides"
        type="number"
        name="userGuidesScore"
        value={formData.userGuidesScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Quality of information contained in the user manual and maintenance file. Description of the software system: structure (architecture), processing processes and process flow, and user interfaces. Use of models (UML). (Score 0-100)"
      />
      <FormField
        label="Comments on the maintenance file"
        type="textarea"
        name="userGuidesComments"
        value={formData.userGuidesComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Organization and clarity"
        type="number"
        name="organizationScore"
        value={formData.organizationScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Organization of the document at a professional level: structure, sequence, systematicity and correct logical structure, linking and matching between the components of the document. Ease of orientation (division into sections, headings). Use of diagrams. Quality and accuracy of wording, balanced distribution of information: proper focus and summarization of important topics. Editing, style and completeness of submission - consideration of all elements as required by the guidelines. (Score 0-100)"
      />
      <FormField
        label="Comments on the organization of the document"
        type="textarea"
        name="organizationComments"
        value={formData.organizationComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="General evaluation"
        type="number"
        name="generalEvaluationScore"
        value={formData.generalEvaluationScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="General impression, difficulty and scope of the project, use of a special approach. (Score 0-100)"
      />
      <FormField
        label="Overall Grade"
        type="number"
        name="overallScore"
        value={formData.overallScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Overall score for the project book (Score 0-100)"
      />
      <FormField
        label="Additional comments"
        type="textarea"
        name="additionalComments"
        value={formData.additionalComments}
        onChange={handleChange}
      />

      <Button type="submit" className="w-full">
        Submit Evaluation
      </Button>
    </form>
  );
}

