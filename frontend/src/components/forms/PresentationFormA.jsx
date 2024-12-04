import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RatingScale from './RatingScale';

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
    ) : type === 'rating' ? (
      <RatingScale
        name={name}
        value={value}
        onChange={onChange}
        required={required}
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

const StudentEvaluation = ({ prefix, formData, handleChange }) => (
  <div className="mb-6 p-4 bg-gray-100 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">{prefix}</h3>
    <FormField
      label="Level of knowledge and answering questions"
      type="rating"
      name={`${prefix.toLowerCase()}Knowledge`}
      value={formData[`${prefix.toLowerCase()}Knowledge`]}
      onChange={handleChange}
      required={true}
      description="Mark from 1 to 10"
    />
    <FormField
      label="Presentation skills"
      type="rating"
      name={`${prefix.toLowerCase()}PresentationSkills`}
      value={formData[`${prefix.toLowerCase()}PresentationSkills`]}
      onChange={handleChange}
      required={true}
      description="Mark from 1 to 10"
    />
    <FormField
      label={`Comments on ${prefix}`}
      type="textarea"
      name={`${prefix.toLowerCase()}Comments`}
      value={formData[`${prefix.toLowerCase()}Comments`]}
      onChange={handleChange}
    />
  </div>
)

export default function PresentationFormA({ onSubmit }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectCode: '',
    evaluatorName: '',
    organizationScore: '',
    organizationComments: '',
    contentScore: '',
    contentComments: '',
    visibilityScore: '',
    visibilityComments: '',
    overallScore: '',
    additionalComments: '',
    student1Knowledge: '',
    student1PresentationSkills: '',
    student1Comments: '',
    student2Knowledge: '',
    student2PresentationSkills: '',
    student2Comments: '',
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
        label="Organization of the presentation at a professional level"
        type="number"
        name="organizationScore"
        value={formData.organizationScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Understandable and clear order of presenting the topics, presenting the material clearly, adhering to the time range (0-100)"
      />
      <FormField
        label="Comments on the organization of the presentation"
        type="textarea"
        name="organizationComments"
        value={formData.organizationComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Quality of the presentation content"
        type="number"
        name="contentScore"
        value={formData.contentScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Description and analysis of the existing situation, review of challenges, description of the problem and the proposed solution, test plan. Basing information on relevant sources, correct focus and summary of important issues. (0-100)"
      />
      <FormField
        label="Comments on the quality of the presentation content"
        type="textarea"
        name="contentComments"
        value={formData.contentComments}
        onChange={handleChange}
        required={true}
      />
      <FormField
        label="Quality of the presentation visibility"
        type="number"
        name="visibilityScore"
        value={formData.visibilityScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Easy to read slides (size, color and density), clarity of graphics. (0-100)"
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
        label="Overall assessment"
        type="number"
        name="overallScore"
        value={formData.overallScore}
        onChange={handleChange}
        min={0}
        max={100}
        required={true}
        description="Difficulty and scope of the project, use of a special approach. (0-100)"
      />
      <FormField
        label="Additional comments"
        type="textarea"
        name="additionalComments"
        value={formData.additionalComments}
        onChange={handleChange}
        required={true}
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

