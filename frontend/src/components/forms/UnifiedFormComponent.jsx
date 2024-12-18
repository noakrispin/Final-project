import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormField from './FormField';
import { api } from '../../services/api';
import { Button } from '../ui/Button';

export default function UnifiedFormComponent({
  formTitle,
  formDescription,
  formFields,
  submitEndpoint,
  students = [],
  studentQuestions = [],
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    const initialData = formFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || '';
      return acc;
    }, {});

    // Initialize student-specific fields
    students.forEach((student, index) => {
      studentQuestions.forEach((question) => {
        const fieldName = `student${index + 1}_${question.name}`;
        initialData[fieldName] = '';
      });
    });

    return initialData;
  });

  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'Supervisor' && user.role !== 'Admin') navigate('/');
  }, [user, navigate]);

  // Calculate progress: General fields + Student fields
  useEffect(() => {
    const generalFields = formFields.filter((f) => f.required && !f.disabled);
    const studentFields = students.flatMap((_, index) =>
      studentQuestions.map((q) => `student${index + 1}_${q.name}`)
    );

    const totalFields = generalFields.length + studentFields.length;
    const completedFields = [
      ...generalFields.map((f) => formData[f.name]),
      ...studentFields.map((field) => formData[field]),
    ].filter((value) => value?.toString().trim() !== '').length;

    setProgress(Math.round((completedFields / Math.max(totalFields, 1)) * 100));
  }, [formData, formFields, students, studentQuestions]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const updatedValue = type === 'number'
      ? value === '' ? '' : Math.max(0, Math.min(100, Number(value)))
      : value;

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
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

  const isFormValid = formFields.every((f) => {
    return !f.required || formData[f.name]?.toString().trim() !== '';
  }) && students.every((_, index) =>
    studentQuestions.every((q) => {
      const fieldName = `student${index + 1}_${q.name}`;
      return !q.required || formData[fieldName]?.toString().trim() !== '';
    })
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
      <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6" >
        <div className="mb-6 text-center">
          <h2 className="text-2xl text-blue-900 font-bold mb-2">{formTitle}</h2>
          {formDescription && (
  <p className="text-gray-600 mb-4 max-w-3xl mx-auto break-words leading-relaxed text-center">
    {formDescription}
  </p>
)}

        </div>

        {/* General Fields */}
        
        <h3 className="text-lg font-bold text-blue-900 mb-4">
          {`Overall Project Evaluation `}
        </h3>
        {formFields.map((field) => (
          <FormField
            key={field.name}
            {...field}
            value={formData[field.name]}
            onChange={handleChange}
          />
        ))}</div>

        {/* Student Evaluation */}
        {students.length > 0 ? (
          students.map((student, index) => (
            <div
              key={`student-${index}`}
              className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6"
            >
              <h3 className="text-lg font-bold text-blue-900 mb-4">
                {`Evaluation for ${student.name}`}
              </h3>
              {studentQuestions.map((question) => {
                const fieldName = `student${index + 1}_${question.name}`;
                return (
                  <FormField
                    key={fieldName}
                    {...question}
                    name={fieldName}
                    value={formData[fieldName]}
                    onChange={handleChange}
                  />
                );
              })}
            </div>
          ))
        ) : (
          <p></p>
        )}


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
