import React, { useState } from 'react';

const EarlyAccessForm = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const response = await fetch('https://formspree.io/f/mrbpeljk', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setShowPopup(true);
        e.target.reset(); // Reset form
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gray-900 relative">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 backdrop-blur-xl">
          <h2 className="text-3xl font-bold text-center mb-2 font-inter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Request Early Access
          </h2>
          <p className="text-center mb-8 text-gray-400 font-jetbrains text-sm">
            $ curl -X POST api.ai-docs.dev/early-access
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-inter font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         text-gray-200 font-inter disabled:opacity-50"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-inter font-medium text-gray-400 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="company"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         text-gray-200 font-inter disabled:opacity-50"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-inter font-medium text-gray-400 mb-2">
                GitHub Username
              </label>
              <input
                type="text"
                name="github"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         text-gray-200 font-inter disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                       text-white py-3 rounded-lg font-inter font-medium 
                       tracking-wide text-sm uppercase hover:from-blue-700 
                       hover:to-purple-700 transition-all duration-300 
                       transform hover:scale-105 disabled:opacity-50
                       flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                'Request Early Access'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPopup(false)} />
          <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md w-full shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-gray-300 mb-6">
                We've received your request for early access. We'll be in touch soon with next steps!
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EarlyAccessForm; 