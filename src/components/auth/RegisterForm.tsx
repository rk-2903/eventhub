import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm<RegisterFormData>();
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data.name, data.email, data.password);
    
    // If no error after registration attempt
    if (!error) {
      setShowSuccessMessage(true);
      // Redirect to home page after successful registration
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white shadow-md rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-gray-600 mt-1">Join EventHub to discover amazing events</p>
        </div>
        
        {error && (
          <Alert 
            variant="error" 
            className="mb-6"
            onClose={() => useAuthStore.setState({ error: null })}
          >
            {error}
          </Alert>
        )}
        
        {showSuccessMessage && (
          <Alert variant="success" className="mb-6">
            Registration successful! Redirecting...
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              label="Full Name"
              type="text"
              id="name"
              placeholder="John Doe"
              leftIcon={<User className="h-5 w-5" />}
              error={errors.name?.message}
              fullWidth
              {...register('name', { 
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
            />
          </div>
          
          <div>
            <Input
              label="Email"
              type="email"
              id="email"
              placeholder="your@email.com"
              leftIcon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              fullWidth
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Invalid email address',
                },
              })}
            />
          </div>
          
          <div>
            <Input
              label="Password"
              type="password"
              id="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              fullWidth
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
          </div>
          
          <div>
            <Input
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              leftIcon={<Lock className="h-5 w-5" />}
              error={errors.confirmPassword?.message}
              fullWidth
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match',
              })}
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </a>
            </label>
          </div>
          
          <Button
            type="submit"
            leftIcon={<UserPlus className="h-5 w-5" />}
            isLoading={isLoading}
            fullWidth
          >
            Create Account
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default RegisterForm;