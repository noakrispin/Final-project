import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import ErrorMessage from '../components/shared/ErrorMessage';
import toast, { Toaster } from 'react-hot-toast';

// Import the mock JSON data
import usersData from '../data/mockUsers.json';

function SignUp() {
  const navigate = useNavigate();
  const [users, setUsers] = useState(usersData); // Simulate user data
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      if (users.some((user) => user.email === data.email)) {
        toast.error('This email is already registered', {
          duration: 5000,
          position: 'top-center',
        });
        return;
      }

      const newUser = { id: users.length + 1, ...data };

      // Simulate adding the user to the system
      setUsers((prevUsers) => [...prevUsers, newUser]);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API response delay

      toast.success('Account created successfully!', {
        duration: 3000,
        position: 'top-center',
      });

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('An error occurred. Please try again.', {
        duration: 5000,
        position: 'top-center',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center items-center py-12">
      {/* Background blur elements */}
      <BlurElements />

      <div className="w-full max-w-[550px] bg-white shadow-md border border-[#d3d3d3] rounded-[20px] relative z-10 p-8">
        <h2 className="text-[26px] font-semibold text-gray-600 mb-2">Create Account</h2>
        <p className="text-lg text-gray-600 mb-6">Sign up to access the Final Project Portal.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Full Name"
            name="fullName"
            register={register}
            required="Full name is required"
            errors={errors}
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            register={register}
            required="Email is required"
            pattern={{
              value: /\S+@\S+\.\S+/,
              message: "Invalid email address"
            }}
            errors={errors}
          />

          <Controller
            name="role"
            control={control}
            rules={{ required: 'Role selection is required' }}
            render={({ field }) => (
              <RoleDropdown
                isOpen={isDropdownOpen}
                onSelect={(role) => {
                  field.onChange(role);
                  setIsDropdownOpen(false);
                }}
                toggle={() => setIsDropdownOpen(!isDropdownOpen)}
                selectedRole={field.value}
                error={errors.role?.message}
              />
            )}
          />

          <PasswordInput
            register={register}
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword(!showPassword)}
            error={errors.password?.message}
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

// Background Blur Elements
const BlurElements = () => (
  <>
    <div className="absolute top-[432px] left-[613px] w-[300px] h-[294px] bg-[#8bd8ff]/40 rounded-full blur-[80px]" />
    <div className="absolute bottom-0 left-[-352px] w-[1000px] h-[1018.69px] bg-[#c8d7ff]/70 rounded-full blur-[70px]" />
  </>
);

// Reusable InputField Component
const InputField = ({ label, name, type = "text", register, required, pattern, errors }) => (
  <div>
    <label htmlFor={name} className="block text-gray-600 mb-1">{label}</label>
    <input
      id={name}
      type={type}
      {...register(name, { required, pattern })}
      className="w-full h-[50px] px-4 border border-[#dadada] rounded-md"
      placeholder={`Enter your ${label.toLowerCase()}`}
    />
    <ErrorMessage message={errors?.[name]?.message} />
  </div>
);

// Role Dropdown Component
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

// Password Input Component
const PasswordInput = ({ register, showPassword, toggleShowPassword, error }) => (
  <div>
    <label htmlFor="password" className="block text-gray-600 mb-1">Password</label>
    <div className="relative">
      <input
        id="password"
        type={showPassword ? 'text' : 'password'}
        {...register('password', {
          required: 'Password is required',
          pattern: {
            value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
            message: 'Password must be at least 8 characters long, include an uppercase letter, a number, and a special character'
          }
        })}
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

