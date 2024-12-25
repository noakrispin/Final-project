import React, { useState } from 'react';

const FormField = ({
  label,
  type,
  name,
  value,
  onChange,
  min,
  max,
  description,
  required,
  disabled,
  placeholder,
  evaluate,
  
}) => {
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let validatedValue = value;

    // Validate number inputs
    if (type === 'number') {
      validatedValue = value === '' ? '' : Math.max(min || 0, Math.min(max || 100, Number(value)));
    }

    // Validate textarea for minimum 5 words
    if (type === 'textarea' && required) {
      const wordCount = value.trim().split(/\s+/).filter((word) => word).length;
      if (wordCount < 5) {
        setError('The comment must contain at least 5 words.');
      } else {
        setError('');
      }
    }

    // Update state
    onChange({ target: { name, value: validatedValue } });
  };

  return (
    <div className="mb-4">
      {/* Label */}
      <label className="block text-gray-700 text-base font-bold mb-1" htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Description */}
      {description && <p className="text-gray-600 text-sm mb-1">{description}</p>}
      
      {/* Input Field */}
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleInputChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder || 'At least 5 words required'}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
          rows="4"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleInputChange}
          min={type === 'number' ? min : undefined}
          max={type === 'number' ? max : undefined}
          required={required}
          disabled={disabled}
          placeholder={placeholder || 'Score 0-100'}
          className={`px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline ${
            type === 'number' ? 'w-32' : 'w-full'
          }`}
        />
      )}

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
