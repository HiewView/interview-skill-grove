
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, FileText, Settings, Users, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const userType = 'candidate'; // TODO: Get from auth context

  if (userType === 'candidate') {
    return <CandidateDashboard />;
  } else {
    return <OrganizationDashboard />;
  }
};

const CandidateDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, John!</h1>
          <p className="text-white/70">Ready for your next interview challenge?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/interview"
            className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Start Interview</h3>
                <p className="text-white/60 text-sm">Begin a new AI interview session</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/profile"
            className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Profile Setup</h3>
                <p className="text-white/60 text-sm">Update your skills and resume</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/reports"
            className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">View Reports</h3>
                <p className="text-white/60 text-sm">Check your interview history</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Interviews */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Upcoming Interviews
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">Frontend Developer - TechCorp</h3>
                    <p className="text-white/60 text-sm">Tomorrow at 2:00 PM</p>
                  </div>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">Scheduled</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">React Developer - StartupXYZ</h3>
                    <p className="text-white/60 text-sm">Dec 20 at 10:00 AM</p>
                  </div>
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Confirmed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
              Recent Performance
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">Mock Interview #3</h3>
                    <p className="text-white/60 text-sm">Technical Skills: JavaScript</p>
                  </div>
                  <span className="text-green-400 font-semibold">85%</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">Mock Interview #2</h3>
                    <p className="text-white/60 text-sm">Behavioral Questions</p>
                  </div>
                  <span className="text-blue-400 font-semibold">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrganizationDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Organization Dashboard</h1>
          <p className="text-white/70">Manage interviews and track candidate performance</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link 
            to="/admin/scheduling"
            className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Schedule Interview</h3>
              <p className="text-white/60 text-sm">Set up new interviews</p>
            </div>
          </Link>

          <Link 
            to="/admin/candidates"
            className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Manage Candidates</h3>
              <p className="text-white/60 text-sm">View and manage applicants</p>
            </div>
          </Link>

          <Link 
            to="/admin/reports"
            className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Analytics</h3>
              <p className="text-white/60 text-sm">View performance metrics</p>
            </div>
          </Link>

          <Link 
            to="/admin/settings"
            className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Settings</h3>
              <p className="text-white/60 text-sm">Configure organization</p>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">24</div>
              <div className="text-white/70">Total Interviews</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">18</div>
              <div className="text-white/70">Completed</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">6</div>
              <div className="text-white/70">Pending</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Interview Activity</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <h3 className="font-medium text-white">John Doe - Frontend Developer</h3>
                <p className="text-white/60 text-sm">Completed 2 hours ago</p>
              </div>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">Completed</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <h3 className="font-medium text-white">Jane Smith - Backend Developer</h3>
                <p className="text-white/60 text-sm">Scheduled for tomorrow</p>
              </div>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">Scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
