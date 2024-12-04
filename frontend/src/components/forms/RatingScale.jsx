import React from 'react';

const RatingScale = ({ name, value, onChange, required = false }) => {
  return (
    <div className="flex space-x-4">
      {[...Array(10)].map((_, i) => (
        <label key={i} className="inline-flex items-center">
          <input
            type="radio"
            name={name}
            value={i + 1}
            checked={parseInt(value) === i + 1}
            onChange={onChange}
            required={required}
            className="form-radio"
          />
          <span className="ml-2">{i + 1}</span>
        </label>
      ))}
    </div>
  );
};

export default RatingScale;
