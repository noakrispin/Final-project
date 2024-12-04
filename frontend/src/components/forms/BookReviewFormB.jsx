import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FormField = ({ label, type, name, value, onChange, min, max, description, required, disabled }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
        rows="4"
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
      />
    )}
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
  </div>
)

export default function BookReviewFormB({ onSubmit }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectCode: '',
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
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    onSubmit(formData);
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <FormField
        label="Project code and student presentation"
        type="text"
        name="projectCode"
        value={formData.projectCode}
        onChange={handleChange}
        required={true}
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
        label="Additional comments"
        type="textarea"
        name="additionalComments"
        value={formData.additionalComments}
        onChange={handleChange}
      />

      <button 
        type="submit" 
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit Evaluation
      </button>
    </form>
  );
}

