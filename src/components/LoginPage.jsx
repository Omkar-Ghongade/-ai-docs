import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const VerificationPopup = ({ onClose, email }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md w-full shadow-2xl">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
          <p className="text-gray-300 mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-blue-400 font-mono mb-4 break-all">
            {email}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Click the link in the email to verify your account and complete the sign-up process.
          </p>
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Got it
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signInWithOtp({ email });
                alert('New verification email sent!');
              }}
              className="w-full text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Didn't receive the email? Send again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordPopup = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setStatus({ loading: false, success: true, error: null });
    } catch (error) {
      setStatus({ loading: false, success: false, error: error.message });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md w-full shadow-2xl">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Reset Password</h3>
          {!status.success && (
            <p className="text-gray-400 mt-2">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          )}
        </div>

        {!status.success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg 
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                         text-gray-200 font-inter"
                placeholder="dev@example.com"
              />
            </div>

            {status.error && (
              <div className="text-red-400 text-sm text-center">
                {status.error}
              </div>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 
                       text-white py-3 rounded-lg font-inter font-medium 
                       tracking-wide text-sm uppercase hover:from-purple-700 
                       hover:to-blue-700 transition-all duration-300 
                       transform hover:scale-105 disabled:opacity-50
                       flex items-center justify-center"
            >
              {status.loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300 mb-6">
              Password reset instructions have been sent to:
              <span className="block text-purple-400 font-mono mt-2 break-all">
                {email}
              </span>
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    githubUsername: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle email/password sign in/up
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              github_username: formData.githubUsername
            }
          }
        });

        if (error) throw error;

        setShowVerificationPopup(true);
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth (GitHub & Google)
  const handleOAuth = async (provider) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'https://upldjxisrxoiyyurfttj.supabase.co/auth/v1/callback',
          scopes: provider === 'github' ? 'repo user' : ''
        }
      });

      if (error) throw error;
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-gray-400 font-jetbrains text-sm">
            {isSignUp ? '$ git init' : '$ git pull origin main'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm font-inter">
            {error}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 font-inter">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         text-gray-200 font-inter"
                placeholder="dev@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 font-inter">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         text-gray-200 font-inter"
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 font-inter">
                  GitHub Username
                </label>
                <input
                  type="text"
                  name="githubUsername"
                  required
                  value={formData.githubUsername}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                           text-gray-200 font-inter"
                  placeholder="@developer"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <label className="ml-2 block text-sm text-gray-400 font-inter">
                  Remember me
                </label>
              </div>
              <button 
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-400 hover:text-blue-300 font-inter"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                       text-white py-3 rounded-lg font-inter font-medium 
                       tracking-wide text-sm uppercase hover:from-blue-700 
                       hover:to-purple-700 transition-all duration-300 
                       transform hover:scale-105 disabled:opacity-50
                       flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* OAuth Buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400 font-inter">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuth('github')}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 border border-gray-700 
                         rounded-lg text-gray-300 hover:bg-gray-700 transition-colors 
                         font-inter disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
              <button
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 border border-gray-700 
                         rounded-lg text-gray-300 hover:bg-gray-700 transition-colors 
                         font-inter disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>
          </div>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 font-inter text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Create one'}
            </button>
          </div>
        </div>
      </div>

      {/* Add the Forgot Password Popup */}
      {showForgotPassword && (
        <ForgotPasswordPopup onClose={() => setShowForgotPassword(false)} />
      )}

      {/* Verification Popup */}
      {showVerificationPopup && (
        <VerificationPopup 
          onClose={() => setShowVerificationPopup(false)}
          email={formData.email}
        />
      )}
    </div>
  );
};

export default LoginPage; 