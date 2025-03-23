import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 10;

  // Add state for credits (in a real app, this would come from your backend)
  const [credits, setCredits] = useState(250);

  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Function to handle GitHub connection
  const handleConnectGitHub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'https://upldjxisrxoiyyurfttj.supabase.co/auth/v1/callback',
          scopes: 'repo user'
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error connecting to GitHub:', error);
      setError('Failed to connect to GitHub. Please try again.');
    }
  };

  // Fetch GitHub repositories when component mounts
  useEffect(() => {
    const fetchRepositories = async () => {
      setLoading(true);
      setError(null);

      try {
        let githubUsername;

        // Get GitHub username from different sources
        if (user?.provider_id === 'github' && user?.user_metadata?.user_name) {
          // If logged in with GitHub
          githubUsername = user.user_metadata.user_name;
        } else if (user?.user_metadata?.github_username) {
          // If set in user metadata
          githubUsername = user.user_metadata.github_username;
        } else if (user?.identities) {
          // Try to find from identities
          const githubIdentity = user.identities.find(
            (identity) => identity.provider === 'github'
          );
          if (githubIdentity?.identity_data?.user_name) {
            githubUsername = githubIdentity.identity_data.user_name;
          }
        }

        if (!githubUsername) {
          throw new Error('GitHub username not found. Try linking your GitHub account.');
        }

        // Fetch all repositories from GitHub API
        // Note: We fetch all repos but paginate on the client side for better UX
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        
        const data = await response.json();
        
        // Transform the API response
        const transformedRepos = data.map(repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description || 'No description available',
          language: repo.language || 'Unknown',
          lastUpdated: formatDate(new Date(repo.updated_at)),
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          url: repo.html_url,
          status: repo.name.includes('docs') ? 'Synced' : 'Not synced',
          isPrivate: repo.private
        }));
        
        setRepositories(transformedRepos);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRepositories();
    }
  }, [user]);

  // Get current repositories for pagination
  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repositories.slice(indexOfFirstRepo, indexOfLastRepo);
  const totalPages = Math.ceil(repositories.length / reposPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Helper function to format dates
  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  // Calculate statistics
  const stats = [
    { 
      label: 'Repositories', 
      value: repositories.length.toString(), 
      change: `+${Math.floor(repositories.length / 3)}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    { 
      label: 'Synced Repos', 
      value: repositories.filter(repo => repo.status === 'Synced').length.toString(), 
      change: '+3',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      label: 'Total Stars', 
      value: repositories.reduce((acc, repo) => acc + repo.stars, 0).toString(), 
      change: '+12',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  // Generate pagination items
  const renderPaginationItems = () => {
    const pageNumbers = [];
    
    // Calculate range of page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust start if end is maxed out
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pageNumbers;
  };

  const handleGenerateDocs = async () => {
    try {
      // Check if user has enough credits
      if (credits <= 0) {
        return;
      }

      // Show loading state
      setIsLoading(true);

      // Call your API endpoint to generate docs
      // const response = await generateDocs();
      
      // Update credits after successful generation
      setCredits(prevCredits => prevCredits - 1);
      
      // Show success message
      console.log('Documentation generated successfully!');
    } catch (error) {
      console.error('Error generating docs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Enhanced Header/Navigation */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
            {/* Logo Area */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  AI Docs
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Documentation Generator</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                Documentation
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                Support
              </button>
              
              {/* Credits Display */}
              <div className="px-3 py-1.5 bg-gray-700 rounded-lg flex items-center">
                <div className="flex items-center mr-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse mr-1.5"></div>
                  <span className="text-green-400 text-xs font-medium">CREDITS</span>
                </div>
                <div className="text-white font-mono font-bold text-sm">
                  {credits.toLocaleString()}
                </div>
                <button className="ml-2 text-blue-400 hover:text-blue-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              
              {/* User Profile */}
              <div className="relative ml-3 flex-shrink-0">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                >
                  <img
                    className="h-9 w-9 rounded-full border-2 border-blue-500 object-cover"
                    src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                    alt="Profile"
                  />
                </button>

                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 border border-gray-700 divide-y divide-gray-700">
                    <div className="px-4 py-3">
                      <p className="text-sm text-white font-medium truncate">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <button className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Billing
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 w-full text-left flex items-center"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Mobile Credits Display */}
              <div className="flex items-center px-2 py-1 bg-gray-700 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1.5"></div>
                <div className="text-white font-mono font-bold text-xs">
                  {credits.toLocaleString()}
                </div>
              </div>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-10 w-10 flex items-center justify-center text-gray-300 rounded-lg bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                {isMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-gray-800 shadow-lg">
            <div className="pt-3 pb-4 space-y-1 px-4">
              {/* User Info (Mobile) */}
              <div className="flex items-center px-3 py-3 mb-2 bg-gray-850 rounded-lg">
                <img
                  className="h-10 w-10 rounded-full border-2 border-blue-500"
                  src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                  alt="Profile"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-white">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
              </div>
              
              {/* Credits Display (Mobile Expanded) */}
              <div className="flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2 mb-2">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse mr-2"></div>
                  <span className="text-green-400 text-xs font-medium">CREDITS</span>
                </div>
                <div className="flex items-center">
                  <div className="text-white font-mono font-bold">
                    {credits.toLocaleString()}
                  </div>
                  <button className="ml-2 text-blue-400 p-1 hover:bg-gray-600 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <button className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentation
              </button>
              <button className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Support
              </button>
              <button className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Billing
              </button>
              <button className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
              <div className="pt-3 mt-3 border-t border-gray-700">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 rounded-lg"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your GitHub repositories
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <div className="text-blue-400">
                    {stat.icon}
                  </div>
                </div>
                <span className="text-green-400 text-sm font-mono">{stat.change}</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* GitHub Repositories Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">GitHub Repositories</h2>
            <a 
              href="https://github.com/new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Repository
            </a>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-red-400 mb-2">GitHub Connection Required</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {error === 'GitHub username not found. Try linking your GitHub account.' 
                  ? 'We need to connect to your GitHub account to display your repositories.' 
                  : `Error: ${error}`}
              </p>
              <div className="flex items-center justify-center">
                <button
                  onClick={handleConnectGitHub}
                  className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Connect GitHub
                </button>
              </div>
            </div>
          ) : repositories.length === 0 ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400 mb-4">No repositories found</p>
              <a 
                href="https://github.com/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Create Repository
              </a>
            </div>
          ) : (
            <>
              {/* Repository Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {currentRepos.map((repo) => (
                  <div key={repo.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 font-medium hover:underline"
                        >
                          {repo.name}
                        </a>
                        {repo.isPrivate && (
                          <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                            Private
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        repo.status === 'Synced' 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {repo.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {repo.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4 mb-4">
                      {repo.language && (
                        <span className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            repo.language === 'JavaScript' ? 'bg-yellow-400' :
                            repo.language === 'TypeScript' ? 'bg-blue-400' :
                            repo.language === 'Python' ? 'bg-green-400' :
                            repo.language === 'Java' ? 'bg-red-400' :
                            repo.language === 'Go' ? 'bg-cyan-400' :
                            repo.language === 'Rust' ? 'bg-orange-400' :
                            'bg-gray-400'
                          }`}></span>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {repo.stars}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        {repo.forks}
                      </span>
                      <span>Updated {repo.lastUpdated}</span>
                    </div>
                    
                    {/* Auto-margin to push the button to the bottom */}
                    <div className="mt-auto pt-3 border-t border-gray-700 flex justify-end">
                      <button 
                        onClick={handleGenerateDocs}
                        disabled={isLoading || credits <= 0}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full transition-all duration-300 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {isLoading ? 'Generating...' : 'Generate Docs'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {repositories.length > reposPerPage && (
                <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400">
                    Showing <span className="font-medium text-white">{indexOfFirstRepo + 1}</span> to{' '}
                    <span className="font-medium text-white">
                      {Math.min(indexOfLastRepo, repositories.length)}
                    </span>{' '}
                    of <span className="font-medium text-white">{repositories.length}</span> repositories
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md flex items-center ${
                        currentPage === 1
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Prev
                    </button>
                    
                    <div className="hidden md:flex space-x-1">
                      {renderPaginationItems()}
                    </div>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md flex items-center ${
                        currentPage === totalPages
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Next
                      <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 