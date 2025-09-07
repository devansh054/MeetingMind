import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Brain, ArrowLeft, User } from "lucide-react";
import { loginUser } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

export default function V0SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoogleSignIn = () => {
    // Google OAuth integration would go here
    console.log("Google sign in clicked");
  };

  const handleMicrosoftSignIn = () => {
    // Microsoft OAuth integration would go here
    console.log("Microsoft sign in clicked");
  };

  const handleDemoLogin = () => {
    setEmail("demo@meetingmind.ai");
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Sign In Card */}
        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Meeting Mind
              </h1>
            </div>

            <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to your account to continue your AI-powered meetings
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Demo Credentials */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-blue-400 font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Demo Credentials
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDemoLogin}
                  className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300"
                >
                  Use Demo
                </Button>
              </div>
              <div className="text-sm text-blue-300/80 space-y-1">
                <p><span className="font-medium">Email:</span> demo@meetingmind.ai</p>
                <p><span className="font-medium">Password:</span> demo123</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white"
                onClick={handleGoogleSignIn}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white"
                onClick={handleMicrosoftSignIn}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"
                  />
                </svg>
                Continue with Microsoft
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900/40 px-2 text-slate-400">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-slate-600 bg-slate-800/50 text-blue-500 focus:ring-blue-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-400">
                    Remember me
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-slate-400">Don't have an account? </span>
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>© 2025 Meeting Mind. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
