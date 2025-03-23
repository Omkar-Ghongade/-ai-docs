import React from 'react';
import PricingSection from './PricingSection';
import EarlyAccessForm from './EarlyAccessForm';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const scrollToEarlyAccess = () => {
    document.getElementById('early-access').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleNpmClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-inter">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 mb-6 border border-blue-500 rounded-full text-blue-400 font-jetbrains text-sm">
              v1.0.0-beta
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 leading-tight">
              AI-Powered GitHub Docs
            </h1>
            <p className="text-xl mb-8 text-gray-300 font-jetbrains">
              <span className="text-blue-400">const</span>{" "}
              <span className="text-purple-400">documentation</span> = {" "}
              <span className="text-green-400">await</span> AI.generate(
              <span className="text-yellow-400">repository</span>);
            </p>
            <button 
              onClick={handleNpmClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold 
                       hover:bg-blue-700 transition-all duration-300 transform 
                       hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 
                       font-jetbrains group flex items-center mx-auto space-x-2"
            >
              <span>npm install @ai-docs/cli</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🤖",
              title: "AI-Powered",
              description: "Advanced ML models analyze your codebase"
            },
            {
              icon: "⚡",
              title: "Real-time Sync",
              description: "Auto-updates with your GitHub repository"
            },
            {
              icon: "🔥",
              title: "Smart Templates",
              description: "Customizable documentation patterns"
            }
          ].map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl bg-gray-800 border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <PricingSection />
      
      {/* Add id to EarlyAccessForm section */}
      <div id="early-access">
        <EarlyAccessForm />
      </div>

      <footer className="bg-gray-800/30 border-t border-gray-800 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-500 font-mono">
          <p>© {new Date().getFullYear()} GitHub Documentation Generator • Made with 💻 by developers</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 