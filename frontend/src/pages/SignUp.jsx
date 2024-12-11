import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import ErrorMessage from '../components/shared/ErrorMessage';
import toast, { Toaster } from 'react-hot-toast';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ID: '', 
    fullName: '',
    email: '',
    role: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const idRegex = /^\d+$/;

    if (!idRegex.test(formData.ID)) {
      newErrors.ID = 'ID must contain only numbers';
    }
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) newErrors.role = 'Role selection is required';

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(formData.password)
    ) {
      newErrors.password =
        'Password must be at least 8 characters long, include an uppercase letter, a number, and a special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) { 
      try {
        const response = await fetch('http://localhost:3001/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ID: formData.ID,
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Account created successfully!', {
            duration: 3000,
            position: 'top-center',
          });

          setFormData({ ID: '', fullName: '', email: '', role: '', password: '' });

          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          toast.error(data.error || 'Failed to create account.', {
            duration: 5000,
            position: 'top-center',
          });
        }
      } catch (error) {
        console.error('Error creating account:', error);
        toast.error('An error occurred. Please try again.', {
          duration: 5000,
          position: 'top-center',
        });
      }
    } else {
      toast.error('Please correct the errors before submitting.', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center items-center py-12">
      <BlurElements />

      <div className="w-full max-w-[550px] bg-white shadow-md border border-[#d3d3d3] rounded-[20px] relative z-10 p-8">
        <h2 className="text-[26px] font-semibold text-gray-600 mb-2">Create Account</h2>
        <p className="text-lg text-gray-600 mb-6">Sign up to access the Final Project Portal.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="ID"
            name="ID"
            type="text"
            value={formData.ID}
            onChange={handleInputChange}
            error={errors.ID}
          />

          {['fullName', 'email'].map((field) => (
            <InputField
              key={field}
              label={field === 'fullName' ? 'Full Name' : 'Email'}
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              value={formData[field]}
              onChange={handleInputChange}
              error={errors[field]}
            />
          ))}

          <RoleDropdown
            isOpen={isDropdownOpen}
            onSelect={(role) => {
              setFormData((prev) => ({ ...prev, role }));
              setIsDropdownOpen(false);
              if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
            }}
            toggle={() => setIsDropdownOpen(!isDropdownOpen)}
            selectedRole={formData.role}
            error={errors.role}
          />

          <PasswordInput
            value={formData.password}
            onChange={handleInputChange}
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          <Button type="submit" className="w-full h-[55px] bg-[#5f6fff] hover:bg-[#4b5ccc] text-white text-lg font-medium rounded-md">
            Create account
          </Button>

          <p className="text-center text-gray-600 text-sm">
            Already have an account? <a href="/login" className="text-[#5f6fff] underline">Login here</a>
          </p>
        </form>
      </div>

      <Toaster />
    </div>
  );
}

export default SignUp;

const BlurElements = () => (
  <>
    <div className="absolute top-[432px] left-[613px] w-[300px] h-[294px] bg-[#8bd8ff]/40 rounded-full blur-[80px]" />
    <div className="absolute bottom-0 left-[-352px] w-[1000px] h-[1018.69px] bg-[#c8d7ff]/70 rounded-full blur-[70px]" />
  </>
);

const InputField = ({ label, name, type, value, onChange, error }) => (
  <div>
    <label htmlFor={name} className="block text-gray-600 mb-1">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full h-[50px] px-4 border border-[#dadada] rounded-md"
      placeholder={`Enter your ${label.toLowerCase()}`}
    />
    <ErrorMessage message={error} />
  </div>
);

const RoleDropdown = ({ isOpen, onSelect, toggle, selectedRole, error }) => (
  <div>
    <label htmlFor="role" className="block text-gray-600 mb-1">Role</label>
    <div className="relative">
      <button
        id="role"
        type="button"
        onClick={toggle}
        className="w-full h-[50px] px-4 flex items-center justify-between border border-[#dadada] rounded-md bg-white"
      >
        {selectedRole || 'Select Role'}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#dadada] rounded-md shadow-lg z-10">
          {['Student', 'Supervisor'].map((option) => (
            <button
              key={option}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
    <ErrorMessage message={error} />
  </div>
);

const PasswordInput = ({ value, onChange, showPassword, toggleShowPassword, error }) => (
  <div>
    <label htmlFor="password" className="block text-gray-600 mb-1">Password</label>
    <div className="relative">
      <input
        id="password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full h-[50px] px-4 border border-[#dadada] rounded-md"
        placeholder="Enter your password"
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2"
        onClick={toggleShowPassword}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    <ErrorMessage message={error} />
    <p className="text-[#515050] text-xs mt-1">
      Password must contain at least 8 characters, including uppercase, number, and special character.
    </p>
  </div>
);
