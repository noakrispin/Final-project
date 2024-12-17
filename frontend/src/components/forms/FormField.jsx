import React from 'react';

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
}) => {
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // Number validation only for number inputs
    let validatedValue = value;
    if (type === 'number') {
      validatedValue = value === '' ? '' : Math.max(min || 0, Math.min(max || 100, Number(value)));
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
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
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
          placeholder={placeholder}
          className={`px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline ${
            type === 'number' ? 'w-32' : 'w-full'
          }`}
        />
      )}
    </div>
  );
};

export default FormField;
