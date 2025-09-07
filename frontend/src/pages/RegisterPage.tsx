import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RootState, AppDispatch } from '../store';
import { registerUser } from '../store/slices/authSlice';
import { RegisterForm } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Brain, Mic, Users, Zap } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error as string;
      if (errorMessage.includes('already exists') || errorMessage.includes('409')) {
        toast.error('An account with this email already exists. Please try logging in instead.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <Brain className="w-10 h-10 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">MeetingMind</h1>
          </div>
          
          <h2 className="text-2xl font-semibold text-white mb-6">
            Join thousands of teams making meetings productive
          </h2>
          
          <div className="space-y-4 text-primary-100">
            <div className="flex items-center">
              <Mic className="w-5 h-5 mr-3" />
              <span>AI-powered transcription and insights</span>
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-3" />
              <span>Automated action items and follow-ups</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-3" />
              <span>Real-time collaboration features</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-600 mt-2">Start making your meetings more productive</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First name
                </label>
                <input
                  {...register('firstName', { 
                    required: 'First name is required',
                    minLength: { value: 1, message: 'First name is required' }
                  })}
                  type="text"
                  className="input-field"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
                </label>
                <input
                  {...register('lastName', { 
                    required: 'Last name is required',
                    minLength: { value: 1, message: 'Last name is required' }
                  })}
                  type="text"
                  className="input-field"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input-field"
                placeholder="john@company.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                type="password"
                className="input-field"
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
