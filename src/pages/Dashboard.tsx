
import React, { useState, useEffect } from 'react';
import { Calendar, PieChart, Clock, Award, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reportService, Report } from '../services/reportService';
import { toast } from "../hooks/use-toast";
import { getApiHeaders, isAuthenticated } from "../utils/apiUtils";

const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!isAuthenticated()) {
          // Redirect to login if not authenticated
          window.location.href = '/signin';
          return;
        }
        
        // Fetch reports from API
        const fetchedReports = await reportService.getReports();
        setReports(fetchedReports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setError("Failed to load your interview reports");
        toast({
          title: "Error",
          description: "Failed to load your interview reports. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
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

  // If not authenticated, we'll redirect in the useEffect
  if (!isAuthenticated()) {
    return (
      <div className="page-transition pt-24 pb-16">
        <div className="page-container text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
            to={reports.length > 0 ? `/report/${reports[0]._id}` : "/dashboard"} 
            className={`glass-card transition-all ${reports.length > 0 ? 'hover:shadow-glass-lg hover:-translate-y-1' : ''} group`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-medium mb-2">Latest Report</h3>
                <p className="text-foreground/70">
                  {reports.length > 0 
                    ? `View your ${formatDate(reports[0].date)} interview results`
                    : "Complete an interview to generate a report"}
                </p>
              </div>
              <div className={`rounded-full p-4 ${reports.length > 0 ? 'bg-primary text-white group-hover:bg-primary/90' : 'bg-muted text-muted-foreground'} transition-colors`}>
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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="glass-card text-center py-8">
              <p className="text-destructive">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : reports.length === 0 ? (
            <div className="glass-card text-center py-12">
              <p className="text-foreground/70">No interview reports yet</p>
              <Link to="/interview" className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors mt-4 inline-block">
                Start Your First Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report._id} className="glass-card hover:shadow-glass-lg transition-all group">
                  <Link to={`/report/${report._id}`} className="block">
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
                          {Math.round(report.overall_score)}%
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
