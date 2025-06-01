
import React, { useState } from 'react';
import { User, Plus, Search, Filter, Calendar, BarChart, FileText } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  experience: number;
  status: 'scheduled' | 'completed' | 'pending';
  score?: number;
  interviewDate?: string;
}

const CandidateManager: React.FC = () => {
  const [candidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'Frontend Developer',
      experience: 3,
      status: 'completed',
      score: 85,
      interviewDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      role: 'Backend Developer',
      experience: 5,
      status: 'scheduled',
      interviewDate: '2024-01-20'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      role: 'Full Stack Developer',
      experience: 4,
      status: 'pending'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500 mb-2">Candidate Management</h1>
            <p className="text-white/60">Manage and track candidate interviews</p>
          </div>
          <button className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Candidate</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/30 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-gray-900 rounded-lg p-6 border border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{candidate.name}</h3>
                    <p className="text-white/60 text-sm">{candidate.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                  {candidate.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-white/60">Role:</span>
                  <span className="text-white">{candidate.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Experience:</span>
                  <span className="text-white">{candidate.experience} years</span>
                </div>
                {candidate.score && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Score:</span>
                    <span className="text-yellow-500 font-semibold">{candidate.score}%</span>
                  </div>
                )}
                {candidate.interviewDate && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Interview:</span>
                    <span className="text-white">{candidate.interviewDate}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-yellow-500 text-black py-2 px-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Schedule</span>
                </button>
                <button className="flex-1 bg-white/10 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center space-x-1">
                  <BarChart className="w-4 h-4" />
                  <span className="text-sm">Report</span>
                </button>
                <button className="bg-white/10 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-colors">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">No candidates found</h3>
            <p className="text-white/60">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateManager;
