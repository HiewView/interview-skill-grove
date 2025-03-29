
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ReportCard from '../components/ReportCard';
import { Download, Share, ChevronLeft } from 'lucide-react';

interface Report {
  _id: string;
  date: string;
  role?: string;
  overall_score: number;
  technical_metrics: Array<{name: string; value: number; color: string}>;
  communication_metrics: Array<{name: string; value: number; color: string}>;
  personality_metrics: Array<{name: string; value: number; color: string}>;
}

const Report: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch the specific report from API using reportId
    // For now, using mock data
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setReport({
        _id: reportId || '1',
        date: '2023-06-15',
        role: 'Software Engineer',
        overall_score: 85,
        technical_metrics: [
          { name: 'Technical Knowledge', value: 85, color: '#3b82f6' },
          { name: 'Problem Solving', value: 78, color: '#3b82f6' },
          { name: 'Code Quality', value: 92, color: '#3b82f6' },
        ],
        communication_metrics: [
          { name: 'Clarity of Expression', value: 88, color: '#10b981' },
          { name: 'Articulation', value: 92, color: '#10b981' },
          { name: 'Active Listening', value: 75, color: '#10b981' },
        ],
        personality_metrics: [
          { name: 'Confidence', value: 82, color: '#8b5cf6' },
          { name: 'Adaptability', value: 90, color: '#8b5cf6' },
          { name: 'Cultural Fit', value: 85, color: '#8b5cf6' },
        ]
      });
      setLoading(false);
    }, 500);
  }, [reportId]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="page-transition pt-24 pb-16">
        <div className="page-container">
          <div className="glass-card text-center p-12">
            <p className="text-lg">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-transition pt-24 pb-16">
        <div className="page-container">
          <div className="glass-card text-center p-12">
            <h2 className="text-2xl font-medium mb-4">Report Not Found</h2>
            <p className="mb-6">The requested report could not be found.</p>
            <Link to="/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition pt-24 pb-16">
      <div className="page-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Link to="/dashboard" className="mr-2 p-1 rounded-full hover:bg-muted">
                <ChevronLeft size={20} />
              </Link>
              <h1 className="text-3xl font-medium">Interview Performance Report</h1>
            </div>
            <p className="text-foreground/70">
              {report.role} Interview • {formatDate(report.date)}
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
                  strokeDashoffset={440 - (440 * report.overall_score) / 100}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-medium">{report.overall_score}%</span>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-medium mb-4">Overall Assessment</h2>
              <p className="text-foreground/80 mb-4">
                {report.overall_score >= 90 ? 
                  "Exceptional performance! You demonstrated outstanding skills and readiness for this role." :
                  report.overall_score >= 80 ?
                  "Strong performance! You demonstrated solid skills and good preparation for this role." :
                  report.overall_score >= 70 ?
                  "Good performance with some areas for improvement. Continue practicing to enhance your skills." :
                  "You have potential but need more practice in key areas to improve your interview performance."}
              </p>
              <div className="space-y-2">
                {report.overall_score >= 75 && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-medium">✓</span>
                    <p>Clear communication and well-structured responses</p>
                  </div>
                )}
                {report.technical_metrics.some(metric => metric.value >= 80) && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-medium">✓</span>
                    <p>Strong technical knowledge and problem-solving skills</p>
                  </div>
                )}
                {report.personality_metrics.some(metric => metric.value < 80) && (
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 font-medium">△</span>
                    <p>Consider working on confidence and adaptability in interviews</p>
                  </div>
                )}
                {report.communication_metrics.some(metric => metric.value < 80) && (
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 font-medium">△</span>
                    <p>Focus on improving clarity and articulation in your responses</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ReportCard title="Technical Skills" metrics={report.technical_metrics} />
          <ReportCard title="Communication" metrics={report.communication_metrics} />
          <ReportCard title="Personal Attributes" metrics={report.personality_metrics} />
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
