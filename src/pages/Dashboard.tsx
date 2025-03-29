
import React, { useState, useEffect } from 'react';
import { Calendar, PieChart, Clock, Award, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InterviewReport {
  _id: string;
  date: string;
  overall_score: number;
  session_id: string;
  role?: string;
}

const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch reports from API
    // For now, using mock data
    setReports([
      {
        _id: '1',
        session_id: 's1',
        date: '2023-06-15',
        overall_score: 85,
        role: 'Software Engineer'
      },
      {
        _id: '2',
        session_id: 's2',
        date: '2023-06-10',
        overall_score: 92,
        role: 'Product Manager'
      },
      {
        _id: '3',
        session_id: 's3',
        date: '2023-06-05',
        overall_score: 78,
        role: 'Data Scientist'
      }
    ]);
    setIsLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-blue-500';
    return 'text-yellow-500';
  };

  return (
    <div className="page-transition pt-24 pb-16">
      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2">Welcome, Candidate</h1>
          <p className="text-foreground/70">
            Track your progress and start new interview sessions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card flex items-center">
            <div className="rounded-full p-3 bg-primary/10 text-primary mr-4">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/70">Average Score</p>
              <p className="text-2xl font-medium">
                {reports.length > 0 ? 
                  Math.round(reports.reduce((sum, report) => sum + report.overall_score, 0) / reports.length) : 0}%
              </p>
            </div>
          </div>
          
          <div className="glass-card flex items-center">
            <div className="rounded-full p-3 bg-primary/10 text-primary mr-4">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/70">Total Interviews</p>
              <p className="text-2xl font-medium">{reports.length}</p>
            </div>
          </div>
          
          <div className="glass-card flex items-center">
            <div className="rounded-full p-3 bg-primary/10 text-primary mr-4">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/70">Practice Time</p>
              <p className="text-2xl font-medium">
                {reports.length * 30} min
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link 
            to="/interview" 
            className="glass-card hover:shadow-glass-lg transition-all hover:-translate-y-1 group"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-medium mb-2">Start New Interview</h3>
                <p className="text-foreground/70">
                  Begin a new AI-powered interview session
                </p>
              </div>
              <div className="rounded-full p-4 bg-primary text-white group-hover:bg-primary/90 transition-colors">
                <Plus size={24} />
              </div>
            </div>
          </Link>
          
          <Link 
            to={reports.length > 0 ? `/report?id=${reports[0]._id}` : "/dashboard"} 
            className="glass-card hover:shadow-glass-lg transition-all hover:-translate-y-1 group"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-medium mb-2">Latest Report</h3>
                <p className="text-foreground/70">
                  View your most recent interview performance
                </p>
              </div>
              <div className="rounded-full p-4 bg-primary text-white group-hover:bg-primary/90 transition-colors">
                <PieChart size={24} />
              </div>
            </div>
          </Link>
        </div>

        {/* Interview Reports */}
        <div>
          <h2 className="text-2xl font-medium mb-6">Interview Reports</h2>
          
          {isLoading ? (
            <div className="glass-card text-center p-8">
              <p>Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="glass-card text-center py-12">
              <p className="text-foreground/70">No interview reports yet</p>
              <Link to="/interview" className="btn-primary mt-4 inline-block">
                Start Your First Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report._id} className="glass-card hover:shadow-glass-lg transition-all group">
                  <Link to={`/report?id=${report._id}`} className="block">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">{report.role || 'Interview'} Session</h3>
                        <div className="flex items-center text-sm text-foreground/70 mt-1">
                          <Calendar size={14} className="mr-1" />
                          <span>{formatDate(report.date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`text-lg font-medium mr-4 ${getScoreColor(report.overall_score)}`}>
                          {report.overall_score}%
                        </div>
                        <div className="rounded-full p-2 bg-muted group-hover:bg-muted/80 transition-colors">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
