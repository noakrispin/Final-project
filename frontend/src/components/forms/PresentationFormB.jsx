import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import FormField from './FormField';
import { api } from '../../services/api';
import { Button } from '../ui/Button';

const StudentEvaluation = ({ prefix, formData, handleChange }) => (
  <div className="mb-6 p-4 bg-gray-100 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">{prefix}</h3>
    <FormField
      label="Level of knowledge and answering questions"
      type="number"
      name={`${prefix.toLowerCase()}Knowledge`}
      value={formData[`${prefix.toLowerCase()}Knowledge`]}
      onChange={handleChange}
      required={true}
      min={0}
      max={100}
      description="Mark from 0 to 100"
    />
    <FormField
      label="Presentation skills"
      type="number"
      name={`${prefix.toLowerCase()}PresentationSkills`}
      value={formData[`${prefix.toLowerCase()}PresentationSkills`]}
      onChange={handleChange}
      required={true}
      min={0}
      max={100}
      description="Mark from 0 to 100"
    />
    <FormField
      label={`Comments on ${prefix}`}
      type="textarea"
      name={`${prefix.toLowerCase()}Comments`}
      value={formData[`${prefix.toLowerCase()}Comments`]}
      onChange={handleChange}
      required={true}
    />
  </div>
);

export default function PresentationFormB() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectCode = searchParams.get('projectCode');
  const projectName = searchParams.get('projectName');
  const students = JSON.parse(searchParams.get('students') || '[]');

  const [formData, setFormData] = useState({
    projectCodeAndName: `${projectCode || ''} - ${projectName || ''}`,
    evaluatorName: '',
    organizationScore: '',
    organizationComments: '',
    systemPresentationScore: '',
    systemPresentationComments: '',
    projectReviewScore: '',
    projectReviewComments: '',
    visibilityScore: '',
    visibilityComments: '',
    overallScore: '',
    additionalComments: '',
    student1Name: students[0]?.name || '',
    student1Knowledge: '',
    student1PresentationSkills: '',
    student1Comments: '',
    student2Name: students[1]?.name || '',
    student2Knowledge: '',
    student2PresentationSkills: '',
    student2Comments: '',
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

  const calculateAverageScore = (formData) => {
    const scores = [
      parseFloat(formData.organizationScore) || 0,
      parseFloat(formData.systemPresentationScore) || 0,
      parseFloat(formData.projectReviewScore) || 0,
      parseFloat(formData.visibilityScore) || 0
    ];
    
    const validScores = scores.filter(score => !isNaN(score));
    if (validScores.length === 0) return 0;
    
    const average = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    return Math.round(average);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate the overall score if not manually set
      if (!formData.overallScore) {
        const calculatedScore = calculateAverageScore(formData);
        setFormData(prev => ({
          ...prev,
          overallScore: calculatedScore
        }));
      }

      const result = await api.submitForm('presentationFormB', {
        ...formData,
        overallScore: formData.overallScore || calculateAverageScore(formData)
      });

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
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Presentation Evaluation - Step B</h2>
        <p className="text-gray-600">
          This is an evaluation form for the end of Part B project presentation. It assesses the organization, content, and visibility of the presentation, as well as individual student performance.
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
        label="Organization of the presentation at a professional level"
        type="number"
        name="organizationScore"
        value={formData.organizationScore}
        onChange={handleChange}
        required={true}
        min={0}
        max={100}
        description="Understandable and clear order of presenting the topics, presenting the material clearly, adhering to the time frame. (Score 0-100)"
      />
      <FormField
        label="Comments on the organization of the presentation at a professional level"
        type="textarea"
        name="organizationComments"
        value={formData.organizationComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Quality of the presentation of the system"
        type="number"
        name="systemPresentationScore"
        value={formData.systemPresentationScore}
        onChange={handleChange}
        required={true}
        min={0}
        max={100}
        description="Description of the background, need and solution. Quality of the software demonstration (demo). (Score 0-100)"
      />
      <FormField
        label="Comments on the quality of the system presentation"
        type="textarea"
        name="systemPresentationComments"
        value={formData.systemPresentationComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Quality of the project review"
        type="number"
        name="projectReviewScore"
        value={formData.projectReviewScore}
        onChange={handleChange}
        required={true}
        min={0}
        max={100}
        description="Project summary, review of challenges, presentation of insights. (Score 0-100)"
      />
      <FormField
        label="Comments on the quality of the project review"
        type="textarea"
        name="projectReviewComments"
        value={formData.projectReviewComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Quality of the presentation visibility"
        type="number"
        name="visibilityScore"
        value={formData.visibilityScore}
        onChange={handleChange}
        required={true}
        min={0}
        max={100}
        description="Slides are easily read (size, color and density), clarity of graphics presentation. (Score 0-100)"
      />
      <FormField
        label="Comments on the quality of the presentation visibility"
        type="textarea"
        name="visibilityComments"
        value={formData.visibilityComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Overall score"
        type="number"
        name="overallScore"
        value={formData.overallScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Overall score for the project presentation (Score 0-100)"
      />

      <StudentEvaluation prefix="Student1" formData={formData} handleChange={handleChange} />
      <StudentEvaluation prefix="Student2" formData={formData} handleChange={handleChange} />

      <FormField
        label="Additional comments"
        type="textarea"
        name="additionalComments"
        value={formData.additionalComments}
        onChange={handleChange}
        required={true}
      />

      <Button 
        type="submit" 
        className="w-full"
      >
        Submit Evaluation
      </Button>
    </form>
  );
}

