import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RootState, AppDispatch } from '../store';
import { loginUser } from '../store/slices/authSlice';
import { LoginForm } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Brain, Mic, Users } from 'lucide-react';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      console.log('Login attempt with:', data.email);
      const result = await dispatch(loginUser(data)).unwrap();
      console.log('Login successful:', result);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error as string);
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
            Transform meetings into actionable outcomes
          </h2>
          
          <div className="space-y-4 text-primary-100">
            <div className="flex items-center">
              <Mic className="w-5 h-5 mr-3" />
              <span>Real-time transcription with AI insights</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-3" />
              <span>Automated follow-ups and task creation</span>
            </div>
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-3" />
              <span>Smart workflow automation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600 mt-2">Sign in to your MeetingMind account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                placeholder="Enter your email"
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
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="input-field"
                placeholder="Enter your password"
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
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
