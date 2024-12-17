import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import FormField from './FormField';
import { Button } from '../ui/Button';

const StudentEvaluation = ({ prefix, formData, handleChange }) => (
  <div className="mb-6 p-4 bg-gray-100 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">{prefix}</h3>
    <FormField
      label={`${prefix} Name`}
      type="text"
      name={`${prefix.toLowerCase()}Name`}
      value={formData[`${prefix.toLowerCase()}Name`]}
      onChange={handleChange}
      disabled={true}
    />
    <FormField
      label="Capability of independent learning"
      type="number"
      name={`${prefix.toLowerCase()}IndependentLearning`}
      value={formData[`${prefix.toLowerCase()}IndependentLearning`]}
      onChange={handleChange}
      min={0}
      max={100}
      required={true}
      description="Ability to learn independently, degree of independent progress. (0-100)"
    />
    <FormField
      label="Teamwork"
      type="number"
      name={`${prefix.toLowerCase()}Teamwork`}
      value={formData[`${prefix.toLowerCase()}Teamwork`]}
      onChange={handleChange}
      min={0}
      max={100}
      required={true}
      description="Collaboration, division of labor, dealing with difficulties. (0-100)"
    />
    <FormField
      label="Overall attitude towards the project"
      type="number"
      name={`${prefix.toLowerCase()}Attitude`}
      value={formData[`${prefix.toLowerCase()}Attitude`]}
      onChange={handleChange}
      min={0}
      max={100}
      required={true}
      description="Creative approach, willingness to invest, pace of progress, meeting the time frame. (0-100)"
    />
  </div>
);

export default function SupervisorForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectCode = searchParams.get('projectCode');
  const projectName = searchParams.get('projectName');
  const students = JSON.parse(searchParams.get('students') || '[]');

  const [formData, setFormData] = useState({
    projectCodeAndName: `${projectCode || ''} - ${projectName || ''}`,
    lecturerName: '',
    analysisAndSolution: '',
    projectDeliverables: '',
    generalEvaluation: '',
    overallScore: '', 
    student1Name: students[0]?.name || '',
    student1IndependentLearning: '',
    student1Teamwork: '',
    student1Attitude: '',
    student2Name: students[1]?.name || '',
    student2IndependentLearning: '',
    student2Teamwork: '',
    student2Attitude: '',
    additionalComments: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Supervisor' && user.role !== 'Admin') {
      navigate('/');
    } else {
      setFormData(prevData => ({
        ...prevData,
        lecturerName: user.fullName
      }));

      // Fetch existing grade data if available
      const fetchGradeData = async () => {
        try {
          const gradeData = await api.getGrade(projectCode, 'supervisor');
          if (gradeData) {
            setFormData(prevData => ({
              ...prevData,
              ...gradeData,
              lecturerName: prevData.lecturerName,
              student1Name: students[0]?.name || '',
              student2Name: students[1]?.name || '',
            }));
          }
        } catch (error) {
          console.error('Error fetching grade data:', error);
        }
      };

      fetchGradeData();
    }
  }, [user, navigate, students, projectCode]);

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
      const result = await api.submitForm('supervisorForm', formData);
      if (result.success) {
        console.log('Form submitted successfully');
        navigate('/ProjectToReview', { state: { formSubmitted: true } });
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
      <h2 className="text-xl font-bold mb-2">Supervisor Evaluation Form</h2>
      <p className="text-gray-600 mb-6">
        Intended to be filled out by the supervisor at the end of stage A or B - please write a score on a scale of (0-100)
      </p>

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
        label="Lecturer's Name"
        type="text"
        name="lecturerName"
        value={formData.lecturerName}
        onChange={handleChange}
        disabled={true}
        required={true}
      />
      <FormField
        label="Analysis and solution formation"
        type="number"
        name="analysisAndSolution"
        value={formData.analysisAndSolution}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Quality of the work process, use of original ideas, level of questions raised during the work. (0-100)"
      />
      <FormField
        label="Quality of the project deliverables"
        type="number"
        name="projectDeliverables"
        value={formData.projectDeliverables}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Quality of the book and project presentation: Description and analysis of the existing situation, review of challenges. Description of the problem and proposed solution, testing plan. Basing information on relevant sources (project data, background material from the literature) as needed. Organization of information at a professional level - structure and order, proper focus and summaries, use of charts and graphics, headings and numbering. (0-100)"
      />
      <FormField
        label="General Evaluation"
        type="number"
        name="generalEvaluation"
        value={formData.generalEvaluation}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="General impression, difficulty and scope of the project, use of a special approach. (0-100)"
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
        description="Overall score (0-100)"
      />

      <StudentEvaluation prefix="Student1" formData={formData} handleChange={handleChange} />
      <StudentEvaluation prefix="Student2" formData={formData} handleChange={handleChange} />

      <FormField
        label="Additional Comments"
        type="textarea"
        name="additionalComments"
        value={formData.additionalComments}
        onChange={handleChange}
        required={true}
      />

      <Button type="submit" className="w-full">
        Submit Evaluation
      </Button>
    </form>
  );
}

