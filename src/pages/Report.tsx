
import React from 'react';
import ReportCard from '../components/ReportCard';
import { Download, Share } from 'lucide-react';
import { Link } from 'react-router-dom';

const Report: React.FC = () => {
  // Mock report data
  const technicalMetrics = [
    { name: 'Technical Knowledge', value: 85, color: '#3b82f6' },
    { name: 'Problem Solving', value: 78, color: '#3b82f6' },
    { name: 'Code Quality', value: 92, color: '#3b82f6' },
  ];

  const communicationMetrics = [
    { name: 'Clarity of Expression', value: 88, color: '#10b981' },
    { name: 'Articulation', value: 92, color: '#10b981' },
    { name: 'Active Listening', value: 75, color: '#10b981' },
  ];

  const personalityMetrics = [
    { name: 'Confidence', value: 82, color: '#8b5cf6' },
    { name: 'Adaptability', value: 90, color: '#8b5cf6' },
    { name: 'Cultural Fit', value: 85, color: '#8b5cf6' },
  ];

  // Calculate overall score
  const calculateOverallScore = () => {
    const allMetrics = [...technicalMetrics, ...communicationMetrics, ...personalityMetrics];
    return Math.round(allMetrics.reduce((sum, metric) => sum + metric.value, 0) / allMetrics.length);
  };

  return (
    <div className="page-transition pt-24 pb-16">
      <div className="page-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-medium mb-2">Interview Performance Report</h1>
            <p className="text-foreground/70">
              Software Engineer Interview • June 15, 2023
            </p>
          </div>
          
          <div className="flex gap-4">
            <button className="btn-outline py-2 flex items-center gap-2">
              <Download size={18} />
              <span>Download</span>
            </button>
            <button className="btn-outline py-2 flex items-center gap-2">
              <Share size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="glass-card mb-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <svg className="w-48 h-48">
                <circle
                  className="text-muted"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="96"
                  cy="96"
                />
                <circle
                  className="text-primary"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="96"
                  cy="96"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * calculateOverallScore()) / 100}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-medium">{calculateOverallScore()}%</span>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-medium mb-4">Overall Assessment</h2>
              <p className="text-foreground/80 mb-4">
                You demonstrated strong technical skills and excellent communication abilities.
                Your performance indicates that you are well-prepared for software engineering interviews.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-medium">✓</span>
                  <p>Excellent problem-solving approach with clear communication</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-medium">✓</span>
                  <p>Strong understanding of technical concepts and implementation</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-500 font-medium">△</span>
                  <p>Consider improving time management during complex problems</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ReportCard title="Technical Skills" metrics={technicalMetrics} />
          <ReportCard title="Communication" metrics={communicationMetrics} />
          <ReportCard title="Personal Attributes" metrics={personalityMetrics} />
        </div>

        {/* Interview Questions */}
        <div className="glass-card mb-10">
          <h2 className="text-2xl font-medium mb-6">Questions Breakdown</h2>
          <div className="space-y-6">
            {[
              {
                question: "Explain how you would design a scalable web application",
                assessment: "Strong understanding of architecture principles and trade-offs",
                score: 92
              },
              {
                question: "Describe a challenging project you worked on recently",
                assessment: "Clear communication of roles, challenges and solutions",
                score: 88
              },
              {
                question: "Implement a function to reverse a linked list",
                assessment: "Correct solution with good time complexity analysis",
                score: 85
              }
            ].map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.question}</h3>
                  <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                    item.score >= 90 ? 'bg-green-100 text-green-800' :
                    item.score >= 80 ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.score}%
                  </span>
                </div>
                <p className="text-foreground/70 text-sm">{item.assessment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="glass-card text-center p-8">
          <h2 className="text-2xl font-medium mb-4">Ready for your next challenge?</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Continue practicing to improve your interview skills and track your progress over time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/interview" className="btn-primary">
              Start New Interview
            </Link>
            <Link to="/dashboard" className="btn-outline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
