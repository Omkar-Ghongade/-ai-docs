import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          navigate('https://ai-docs-five.vercel.app/dashboard');
        } else {
          navigate('https://ai-docs-five.vercel.app/login');
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
        navigate('https://ai-docs-five.vercel.app/login');
      }
    };

    handleRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400 font-inter">Completing authentication...</p>
      </div>
    </div>
  );
};

export default RedirectHandler; 