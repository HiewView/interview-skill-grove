
import React from 'react';
import InterviewInterface from '../components/InterviewInterface';

const Interview: React.FC = () => {
  return (
    <div className="page-transition pt-20 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="glass border border-border rounded-xl overflow-hidden mt-4 mb-8">
          <InterviewInterface />
        </div>
      </div>
    </div>
  );
};

export default Interview;
