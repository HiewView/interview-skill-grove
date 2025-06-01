
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Code, Users, Briefcase, Settings } from 'lucide-react';

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  questionTypes: string[];
  candidateCount: number;
}

const RoleTemplates: React.FC = () => {
  const [templates] = useState<RoleTemplate[]>([
    {
      id: '1',
      name: 'Frontend Developer',
      description: 'Interview template for frontend development positions focusing on React, JavaScript, and UI/UX skills.',
      skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
      difficulty: 'intermediate',
      duration: 45,
      questionTypes: ['Technical', 'Coding', 'Behavioral'],
      candidateCount: 12
    },
    {
      id: '2',
      name: 'Backend Developer',
      description: 'Comprehensive backend interview covering APIs, databases, and system design.',
      skills: ['Node.js', 'Python', 'SQL', 'REST APIs', 'System Design'],
      difficulty: 'advanced',
      duration: 60,
      questionTypes: ['Technical', 'System Design', 'Coding'],
      candidateCount: 8
    },
    {
      id: '3',
      name: 'Junior Developer',
      description: 'Entry-level position interview focusing on fundamentals and learning ability.',
      skills: ['Programming Basics', 'Problem Solving', 'Communication'],
      difficulty: 'beginner',
      duration: 30,
      questionTypes: ['Technical', 'Behavioral'],
      candidateCount: 15
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500 mb-2">Role Templates</h1>
            <p className="text-white/60">Create and manage interview templates for different roles</p>
          </div>
          <button className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Template</span>
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-gray-900 rounded-lg p-6 border border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{template.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-2 text-white/60 hover:text-yellow-500 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/70 text-sm mb-4 line-clamp-3">{template.description}</p>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {template.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-500/30">
                      {skill}
                    </span>
                  ))}
                  {template.skills.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                      +{template.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Question Types */}
              <div className="mb-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Question Types</h4>
                <div className="flex flex-wrap gap-2">
                  {template.questionTypes.map((type, index) => (
                    <span key={index} className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs border border-white/20">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-yellow-500 font-semibold text-lg">{template.duration}m</div>
                  <div className="text-white/60 text-xs">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-500 font-semibold text-lg">{template.candidateCount}</div>
                  <div className="text-white/60 text-xs">Candidates</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-yellow-500 text-black py-2 px-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Assign</span>
                </button>
                <button className="flex-1 bg-white/10 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center space-x-1">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Configure</span>
                </button>
                <button className="bg-white/10 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-colors">
                  <Code className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">No templates found</h3>
            <p className="text-white/60 mb-4">Create your first role template to get started</p>
            <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors">
              Create Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleTemplates;
