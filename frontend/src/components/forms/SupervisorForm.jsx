import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import FormField from './FormField';

const StudentEvaluation = ({ prefix, formData, handleChange }) => (
  <div className="mb-6 p-4 bg-gray-100 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">{prefix}</h3>
    <FormField
      label={`${prefix} Name`}
      type="text"
      name={`${prefix.toLowerCase()}Name`}
      value={formData[`${prefix.toLowerCase()}Name`]}
      onChange={handleChange}
    />
    <FormField
      label="Capability of independent learning"
      type="number"
      name={`${prefix.toLowerCase()}IndependentLearning`}
      value={formData[`${prefix.toLowerCase()}IndependentLearning`]}
      onChange={handleChange}
      min={0}
      max={100}
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
      description="Creative approach, willingness to invest, pace of progress, meeting the time frame. (0-100)"
    />
  </div>
);

export default function SupervisorForm({ onSubmit }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get('projectId');

  const [formData, setFormData] = useState({
    projectId: projectId || '',
    projectName: '',
    lecturerName: '',
    analysisAndSolution: '',
    projectDeliverables: '',
    generalEvaluation: '',
    overallScore: '', 
    student1Name: '',
    student1IndependentLearning: '',
    student1Teamwork: '',
    student1Attitude: '',
    student2Name: '',
    student2IndependentLearning: '',
    student2Teamwork: '',
    student2Attitude: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Supervisor' && user.role !== 'Admin') {
      navigate('/');
    } else {
      setFormData(prevData => ({
        ...prevData,
        lecturerName: user.role === 'Supervisor' ? user.fullName : ''
      }));
      
      if (projectId) {
        // Fetch project data and update formData
        console.log('Fetching data for project:', projectId);
        // You would typically call your API here to get the project details
        // For now, we'll just log the projectId
      }
    }
  }, [user, navigate, projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    onSubmit(formData);
  };

  if (!user || (user.role !== 'Supervisor' && user.role !== 'Admin')) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-gray-600 mb-6">Intended to be filled out by the supervisor at the end of stage A or B - please write a score on a scale of (0-100)</p>

      <FormField
        label="Project Name"
        type="text"
        name="projectName"
        value={formData.projectName}
        onChange={handleChange}
      />
      <FormField
        label="Lecturer's Name"
        type="text"
        name="lecturerName"
        value={formData.lecturerName}
        onChange={handleChange}
        disabled={user.role === 'Supervisor'}
      />
      <FormField
        label="Analysis and solution formation"
        type="number"
        name="analysisAndSolution"
        value={formData.analysisAndSolution}
        onChange={handleChange}
        min={0}
        max={100}
        description="Quality of the work process, use of original ideas, level of questions raised during the work. (0-100)"
      />
      <FormField
        label="Quality of the project deliverables"
        type="textarea"
        name="projectDeliverables"
        value={formData.projectDeliverables}
        onChange={handleChange}
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
        description="General impression, difficulty and scope of the project, use of a special approach. (0-100)"
      />
      <FormField
        label="Overall score"
        type="number"
        name="overallScore"
        value={formData.overallScore}
        onChange={handleChange}
        min={0}
        max={100}
        description="Overall score (0-100)"
      />

      <StudentEvaluation prefix="Student1" formData={formData} handleChange={handleChange} />
      <StudentEvaluation prefix="Student2" formData={formData} handleChange={handleChange} />

      <button 
        type="submit" 
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit Evaluation
      </button>
    </form>
  );
}

