
import React, { useState } from 'react';
import { Calendar, PieChart, Clock, Award, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InterviewSession {
  id: string;
  title: string;
  date: string;
  score: number;
  duration: string;
}

const Dashboard: React.FC = () => {
  const [interviewHistory] = useState<InterviewSession[]>([
    {
      id: '1',
      title: 'Software Engineer Interview',
      date: '2023-06-15',
      score: 85,
      duration: '32 min'
    },
    {
      id: '2',
      title: 'Product Manager Interview',
      date: '2023-06-10',
      score: 92,
      duration: '45 min'
    },
    {
      id: '3',
      title: 'Data Scientist Interview',
      date: '2023-06-05',
      score: 78,
      duration: '28 min'
    }
  ]);

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
                {interviewHistory.reduce((sum, session) => sum + session.score, 0) / 
                 Math.max(interviewHistory.length, 1)}%
              </p>
            </div>
          </div>
          
          <div className="glass-card flex items-center">
            <div className="rounded-full p-3 bg-primary/10 text-primary mr-4">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/70">Total Sessions</p>
              <p className="text-2xl font-medium">{interviewHistory.length}</p>
            </div>
          </div>
          
          <div className="glass-card flex items-center">
            <div className="rounded-full p-3 bg-primary/10 text-primary mr-4">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/70">Practice Time</p>
              <p className="text-2xl font-medium">
                {interviewHistory.reduce((sum, session) => {
                  return sum + parseInt(session.duration.split(' ')[0]);
                }, 0)} min
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
            to="/report" 
            className="glass-card hover:shadow-glass-lg transition-all hover:-translate-y-1 group"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-medium mb-2">View Reports</h3>
                <p className="text-foreground/70">
                  Analyze your performance and get insights
                </p>
              </div>
              <div className="rounded-full p-4 bg-primary text-white group-hover:bg-primary/90 transition-colors">
                <PieChart size={24} />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Interview History */}
        <div>
          <h2 className="text-2xl font-medium mb-6">Recent Interview Sessions</h2>
          
          {interviewHistory.length === 0 ? (
            <div className="glass-card text-center py-12">
              <p className="text-foreground/70">No interview sessions yet</p>
              <Link to="/interview" className="btn-primary mt-4 inline-block">
                Start Your First Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {interviewHistory.map((session) => (
                <div key={session.id} className="glass-card hover:shadow-glass-lg transition-all group">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{session.title}</h3>
                      <div className="flex items-center text-sm text-foreground/70 mt-1">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(session.date)}</span>
                        <span className="mx-2">•</span>
                        <Clock size={14} className="mr-1" />
                        <span>{session.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`text-lg font-medium mr-4 ${getScoreColor(session.score)}`}>
                        {session.score}%
                      </div>
                      <Link to={`/report?id=${session.id}`} className="rounded-full p-2 bg-muted group-hover:bg-muted/80 transition-colors">
                        <ChevronRight size={20} />
                      </Link>
                    </div>
                  </div>
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
