import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Password updated successfully
      navigate('/login');
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Set New Password
          </h2>
          <p className="mt-2 text-gray-400 font-jetbrains text-sm">
            Enter your new password below
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg 
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                         text-gray-200 font-inter"
                placeholder="••••••••"
                minLength={6}
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
                       transform hover:scale-105 disabled:opacity-50"
            >
              {status.loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 