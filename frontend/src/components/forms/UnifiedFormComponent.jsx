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
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const updatedValue = type === 'number' ? (value === '' ? '' : Math.max(0, Math.min(100, Number(value)))) : value;
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

  const getColor = (progress) => {
    if (progress <= 30) return 'stroke-red-500';
    if (progress <= 70) return 'stroke-orange-400';
    return 'stroke-green-500';
  };

  return (
    <div className="relative p-6">
      {/* Interactive Progress Circle */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex flex-col items-center">
          {/* Buttons */}
          <div className="w-full flex justify-between mb-2">
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {isMinimized ? 'Expand' : 'Minimize'}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          {/* Progress Circle */}
          {!isMinimized && (
            <svg width="80" height="80" className="transform -rotate-90">
              <circle cx="40" cy="40" r="35" stroke="#e0e0e0" strokeWidth="6" fill="none" />
              <circle
                cx="40"
                cy="40"
                r="35"
                strokeWidth="6"
                fill="none"
                strokeDasharray="220"
                strokeDashoffset={(220 * (100 - progress)) / 100}
                strokeLinecap="round"
                className={`transition-all duration-500 ${getColor(progress)}`}
              />
            </svg>
          )}
          <p className="text-sm font-semibold mt-1">{`Form Progress: ${progress}%`}</p>
        </div>
      )}

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
