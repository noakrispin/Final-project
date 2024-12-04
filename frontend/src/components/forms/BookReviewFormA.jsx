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

export default function BookReviewFormA({ onSubmit }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectCode: '',
    evaluatorName: '',
    introductionScore: '',
    introductionComments: '',
    analysisScore: '',
    analysisComments: '',
    processScore: '',
    processComments: '',
    artifactsScore: '',
    artifactsComments: '',
    organizationScore: '',
    organizationComments: '',
    languageComments: '',
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
      <p className="text-gray-600 mb-6">For book reviewers</p>

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
        label="Description of needs and project goals"
        type="number"
        name="introductionScore"
        value={formData.introductionScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Quality of the introduction: Description and analysis of the current situation, review of challenges. Description and definition of the problem and the proposed solution. (Score 0-100)"
      />
      <FormField
        label="Comments on the quality of the introduction"
        type="textarea"
        name="introductionComments"
        value={formData.introductionComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Analysis and solution formation"
        type="number"
        name="analysisScore"
        value={formData.analysisScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Analysis of the problem and description and the proposed solution. Basing information, considerations and decisions on relevant sources (project data, background material), without general or superficial statements. Use of quality sources. (Score 0-100)"
      />
      <FormField
        label="Comments on the analysis of the problem"
        type="textarea"
        name="analysisComments"
        value={formData.analysisComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Research / Engineering Process"
        type="number"
        name="processScore"
        value={formData.processScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Challenges in research / development. Implementation plan: research approaches, algorithms, technology, description of the research / development process. Explanations of the various work stages, various constraints and ways to deal with their consequences. (Score 0-100)"
      />
      <FormField
        label="Comments on the description of the work process"
        type="textarea"
        name="processComments"
        value={formData.processComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Work Artifacts"
        type="number"
        name="artifactsScore"
        value={formData.artifactsScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Description of the work products in the project: The algorithm/software system developed: principle/operation logic, processing processes and process flow and interfaces, the software structure (architecture) and data. Use of models (flowchart, Pseudo-code, structural diagram, UML). Description of the user interface, the testing plan of the products. (Score 0-100)"
      />
      <FormField
        label="Comments on the work products"
        type="textarea"
        name="artifactsComments"
        value={formData.artifactsComments}
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
        description="Organization of the document at a professional level: structure, sequence, systematicity and correct logical structure, linking and matching between the components of the document. Ease of orientation (division into sections, headings). Use of diagrams. Quality and accuracy in wording, balanced distribution of information: proper focus and brevity of the important topics. Editing, style and completeness of presentation - consideration of all elements as required by the guidelines. (Score 0-100)"
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
        label="Comments on the language (syntax, spelling, writing style, etc.)"
        type="textarea"
        name="languageComments"
        value={formData.languageComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="General Evaluation"
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

