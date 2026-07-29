import React from 'react';
import { Cpu, Zap } from 'lucide-react';
import AICvReviewEngine from '../../../components/jobseeker/cv/AICvReviewEngine';

const AICvReview = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-body-md text-slate-800 antialiased">
      <main className="mx-auto max-w-7xl space-y-6">
        
        {/* Engine Container */}
        <div className="shadow-lg rounded-3xl overflow-hidden">
          {/* Use the shared Engine. Notice we don't pass onClose so it won't show the Close button */}
          <AICvReviewEngine />
        </div>
      </main>
    </div>
  );
};

export default AICvReview;
