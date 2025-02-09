import React, { useState } from "react";

/**
 * This component renders a form field with various input types and validation.
 * 
 * Props:
 * - label: The label for the form field.
 * - type: The type of the input field (e.g., "text", "number", "textarea", "select", "radio").
 * - name: The name of the input field.
 * - value: The current value of the input field.
 * - onChange: Function to handle changes to the input field.
 * - min: The minimum value for number inputs.
 * - max: The maximum value for number inputs.
 * - description: A description or helper text for the form field.
 * - required: Boolean indicating if the field is required.
 * - disabled: Boolean indicating if the field is disabled.
 * - placeholder: Placeholder text for the input field.
 * - options: Array of options for select or radio input types.
 */
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
  options, // For dropdown or radio types
}) => {
  const [error, setError] = useState("");

  /**
   * Handles input changes and validates the input value.
   * @param {Event} e - The input change event.
   */
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let updatedValue = value;

    // Validate number inputs
    if (type === "number") {
      updatedValue = value === "" ? "" : Math.max(min || 0, Math.min(max || 100, Number(value)));
    }

    // Validate text for minimum 5 words
    if (type === "textarea" && required) {
      const wordCount = value.trim().split(/\s+/).filter((word) => word).length;
      if (wordCount < 5) {
        setError("The comment must contain at least 5 words.");
      } else {
        setError("");
      }
    }

    // Clear any existing error for other field types
    if (type !== "textarea") {
      setError("");
    }

    // Propagate to parent
    onChange({ target: { name, value: updatedValue } });
  };

  /**
   * Renders the appropriate input field based on the type prop.
   */
  const renderInputField = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            id={name}
            name={name}
            value={value || ""}
            onChange={handleInputChange}
            required={required}
            disabled={disabled}
            placeholder={placeholder || "At least 5 words required"}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
            rows="4"
          />
        );
      case "select":
        return (
          <select
            id={name}
            name={name}
            value={value || ""}
            onChange={handleInputChange}
            required={required}
            disabled={disabled}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
          >
            <option value="" disabled>
              {placeholder || "Select an option"}
            </option>
            {options &&
              options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        );
      case "radio":
        return (
          <div className="flex flex-wrap gap-4">
            {options &&
              options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="form-radio focus:outline-none focus:shadow-outline"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
          </div>
        );
      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value || ""}
            onChange={handleInputChange}
            min={type === "number" ? min : undefined}
            max={type === "number" ? max : undefined}
            required={required}
            disabled={disabled}
            placeholder={placeholder || (type === "number" ? "Score 0-100" : "Enter Value")}
            className={`px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline ${
              type === "number" ? "w-32" : "w-full"
            }`}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      {/* Label */}
      <label
        className="block text-gray-700 text-base font-bold mb-1"
        htmlFor={name}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Description */}
      {description && <p className="text-gray-700 text-base mb-1">{description}</p>}

      {/* Input Field */}
      {renderInputField()}

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
