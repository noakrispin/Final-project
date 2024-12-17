import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormField from './FormField';
import { api } from '../../services/api';
import { Button } from '../ui/Button';

export default function UnifiedFormComponent({ formTitle, formDescription, formFields, submitEndpoint }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(
    formFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || '';
      return acc;
    }, {})
  );

  const [progress, setProgress] = useState(0);

  // Protect route and auto-populate user-related fields
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Supervisor' && user.role !== 'Admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Calculate progress
  useEffect(() => {
    const totalFields = formFields.filter((field) => !field.disabled && field.required).length;
    const completedFields = formFields.filter(
      (field) => field.required && !field.disabled && formData[field.name]?.toString().trim() !== ''
    ).length;

    setProgress(Math.round((completedFields / totalFields) * 100));
  }, [formData, formFields]);

  // Updated handleChange function
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let updatedValue;

    if (type === 'number') {
      updatedValue = value === '' ? '' : Math.max(0, Math.min(100, Number(value)));
    } else {
      updatedValue = value;
    }

    setFormData((prevData) => ({ ...prevData, [name]: updatedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await api.submitForm(submitEndpoint, formData);
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

  const isFormValid = formFields.every(
    (field) => !field.required || formData[field.name]?.toString().trim() !== ''
  );

  return (
    <div className="relative p-6">
      {/* Progress Circle */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
        <svg width="50" height="50" className="transform -rotate-90">
          <circle cx="25" cy="25" r="20" stroke="#e0e0e0" strokeWidth="6" fill="none" />
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="#3b82f6"
            strokeWidth="6"
            fill="none"
            strokeDasharray="125.6"
            strokeDashoffset={(125.6 * (100 - progress)) / 100}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <p className="text-center text-sm font-semibold mt-1">{progress}%</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">{formTitle}</h2>
          {formDescription && <p className="text-gray-600 mb-4">{formDescription}</p>}
        </div>

        {/* Render Form Fields */}
        {formFields.map((field) => (
          <div key={field.name}>
            <FormField
              label={field.label}
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.required}
              disabled={field.disabled}
              description={field.description}
              placeholder={field.placeholder}
              min={field.type === 'number' ? 0 : undefined}
              max={field.type === 'number' ? 100 : undefined}
            />
          </div>
        ))}

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <Button type="submit" className="w-64" disabled={!isFormValid}>
            Submit Evaluation
          </Button>
        </div>
      </form>
    </div>
  );
}
