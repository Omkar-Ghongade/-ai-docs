import React, { useState } from 'react';

const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'oss',
      name: 'OSS',
      price: 'Free',
      highlight: false,
      features: [
        'Basic documentation generation',
        '3 repositories',
        'Community support',
        'Basic templates'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      highlight: true,
      features: [
        'Advanced documentation generation',
        'Unlimited repositories',
        'Priority support',
        'Custom templates',
        'API access'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      highlight: false,
      features: [
        'Everything in Pro',
        'Custom integration',
        'Dedicated support',
        'SLA guarantee',
        'On-premise deployment'
      ]
    }
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  return (
    <section className="py-20 bg-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent"></div>
      <div className="container mx-auto px-4 relative">
        <h2 className="text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Choose Your Plan
        </h2>
        <p className="text-center mb-12 text-gray-400 font-jetbrains">
          $ git checkout pricing
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full ${
                selectedPlan === plan.id || plan.highlight 
                  ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'border border-gray-700 hover:border-blue-500/50'
              }`}
            >
              {plan.highlight && !selectedPlan && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg font-jetbrains text-sm">
                  Popular
                </div>
              )}
              {selectedPlan === plan.id && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg font-jetbrains text-sm">
                  Selected
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col">
                <div>
                  <h3 className="text-2xl font-bold mb-2 font-jetbrains">{plan.name}</h3>
                  <p className="text-4xl font-bold mb-6 text-blue-400">{plan.price}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-300">
                      <svg className={`w-5 h-5 mr-2 flex-shrink-0 ${
                        selectedPlan === plan.id ? 'text-blue-500' : 'text-gray-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 rounded-lg font-inter font-medium tracking-wide text-sm uppercase transition-all duration-300 transform hover:scale-105 ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.highlight && !selectedPlan
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Coming Soon' : 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 