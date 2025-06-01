
import React from 'react';
import { User, Building, Calendar, BarChart, Settings, Bell, LogOut, Play, Clock, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
  // TODO: Get user type from authentication context
  const userType = 'candidate'; // This will come from auth context

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Header */}
      <nav className="bg-gray-900 border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {userType === 'candidate' ? 'Candidate Dashboard' : 'Organization Dashboard'}
                </h1>
                <p className="text-white/60 text-sm">Welcome back, John Doe</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-white/60 hover:text-yellow-500 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/60 hover:text-yellow-500 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/60 hover:text-yellow-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userType === 'candidate' ? <CandidateDashboard /> : <OrganizationDashboard />}
      </div>
    </div>
  );
};

const CandidateDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="Start Interview"
          description="Begin a new AI-powered interview session"
          icon={Play}
          bgColor="bg-yellow-500"
          onClick={() => console.log('Start Interview')}
        />
        <ActionCard
          title="View Reports"
          description="Check your past interview performance"
          icon={BarChart}
          bgColor="bg-yellow-500"
          onClick={() => console.log('View Reports')}
        />
        <ActionCard
          title="Schedule Interview"
          description="Book an interview session for later"
          icon={Calendar}
          bgColor="bg-yellow-500"
          onClick={() => console.log('Schedule Interview')}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-yellow-500/30">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <ActivityItem
            title="Software Engineer Interview"
            description="Completed 2 hours ago"
            score={85}
          />
          <ActivityItem
            title="Frontend Developer Interview"
            description="Completed yesterday"
            score={78}
          />
          <ActivityItem
            title="Full Stack Developer Interview"
            description="Completed 3 days ago"
            score={92}
          />
        </div>
      </div>
    </div>
  );
};

const OrganizationDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard
          title="Add Candidates"
          description="Register new candidates for interviews"
          icon={User}
          bgColor="bg-yellow-500"
          onClick={() => console.log('Add Candidates')}
        />
        <ActionCard
          title="View Reports"
          description="Analyze candidate performance"
          icon={BarChart}
          bgColor="bg-yellow-500"
          onClick={() => console.log('View Reports')}
        />
        <ActionCard
          title="Manage Templates"
          description="Create and edit interview templates"
          icon={Settings}
          bgColor="bg-yellow-500"
          onClick={() => console.log('Manage Templates')}
        />
        <ActionCard
          title="Schedule Interviews"
          description="Book interview sessions"
          icon={Calendar}
          bgColor="bg-yellow-500"
          onClick={() => console.log('Schedule Interviews')}
        />
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Candidates" value="156" change="+12 this week" />
        <StatCard title="Completed Interviews" value="89" change="+8 this week" />
        <StatCard title="Average Score" value="82.5" change="+2.3 from last week" />
      </div>

      {/* Recent Interviews */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-yellow-500/30">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Interviews</h2>
        <div className="space-y-4">
          <InterviewItem
            candidate="John Smith"
            role="Software Engineer"
            date="2 hours ago"
            score={85}
            status="Completed"
          />
          <InterviewItem
            candidate="Sarah Johnson"
            role="Frontend Developer"
            date="Yesterday"
            score={78}
            status="Completed"
          />
          <InterviewItem
            candidate="Mike Chen"
            role="Full Stack Developer"
            date="In Progress"
            score={null}
            status="Active"
          />
        </div>
      </div>
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  bgColor: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon: Icon, bgColor, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group p-6 rounded-2xl bg-gray-900 border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 text-left w-full"
    >
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-black" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm">{description}</p>
    </button>
  );
};

interface ActivityItemProps {
  title: string;
  description: string;
  score: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, description, score }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-white/10">
      <div>
        <h4 className="text-white font-medium">{title}</h4>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-yellow-500">{score}%</div>
        <div className="text-xs text-white/60">Score</div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-yellow-500/30">
      <h3 className="text-white/80 text-sm font-medium mb-2">{title}</h3>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-yellow-500 text-sm">{change}</div>
    </div>
  );
};

interface InterviewItemProps {
  candidate: string;
  role: string;
  date: string;
  score: number | null;
  status: string;
}

const InterviewItem: React.FC<InterviewItemProps> = ({ candidate, role, date, score, status }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-white/10">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-black" />
        </div>
        <div>
          <h4 className="text-white font-medium">{candidate}</h4>
          <p className="text-white/60 text-sm">{role} • {date}</p>
        </div>
      </div>
      <div className="text-right">
        {score !== null && (
          <div className="text-lg font-bold text-yellow-500">{score}%</div>
        )}
        <div className={`text-xs px-2 py-1 rounded-full ${
          status === 'Completed' ? 'bg-green-500/20 text-green-400' : 
          status === 'Active' ? 'bg-yellow-500/20 text-yellow-400' : 
          'bg-gray-500/20 text-gray-400'
        }`}>
          {status}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
