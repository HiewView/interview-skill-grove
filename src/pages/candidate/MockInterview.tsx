
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Brain, Code, Users, Play } from 'lucide-react';

const MockInterview: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    interviewType: '',
    duration: '30',
    difficulty: 'medium',
    focusAreas: [] as string[],
    includeCodeChallenge: false,
    includeBehavioral: true
  });

  const interviewTypes = [
    { value: 'technical', label: 'Technical Interview', icon: Code, description: 'Focus on coding skills and technical knowledge' },
    { value: 'behavioral', label: 'Behavioral Interview', icon: Users, description: 'Focus on soft skills and past experiences' },
    { value: 'full', label: 'Full Interview', icon: Brain, description: 'Combination of technical and behavioral questions' }
  ];

  const focusAreaOptions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'System Design', 'Data Structures',
    'Algorithms', 'Database Design', 'API Design', 'Frontend Development',
    'Backend Development', 'DevOps', 'Machine Learning', 'Leadership'
  ];

  const handleFocusAreaToggle = (area: string) => {
    setSettings(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleStartInterview = () => {
    console.log('Starting mock interview with settings:', settings);
    navigate('/candidate/interview', { state: { mockInterview: true, settings } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/candidate/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mock <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Interview</span>
          </h1>
          <p className="text-xl text-gray-600">
            Practice with our AI interviewer to improve your skills and confidence
          </p>
        </div>

        <div className="space-y-8">
          {/* Interview Type Selection */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Interview Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSettings(prev => ({ ...prev, interviewType: type.value }))}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      settings.interviewType === type.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${
                      settings.interviewType === type.value ? 'text-orange-500' : 'text-gray-400'
                    }`} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                Duration
              </h3>
              <div className="space-y-3">
                {[
                  { value: '15', label: '15 minutes - Quick practice' },
                  { value: '30', label: '30 minutes - Standard interview' },
                  { value: '45', label: '45 minutes - Extended session' },
                  { value: '60', label: '60 minutes - Full interview' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="duration"
                      value={option.value}
                      checked={settings.duration === option.value}
                      onChange={(e) => setSettings(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="ml-3 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-orange-500" />
                Difficulty Level
              </h3>
              <div className="space-y-3">
                {[
                  { value: 'easy', label: 'Easy - Entry level questions' },
                  { value: 'medium', label: 'Medium - Mid-level challenges' },
                  { value: 'hard', label: 'Hard - Senior level problems' },
                  { value: 'expert', label: 'Expert - Advanced scenarios' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="difficulty"
                      value={option.value}
                      checked={settings.difficulty === option.value}
                      onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="ml-3 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Focus Areas */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Focus Areas (Optional)</h3>
            <p className="text-gray-600 mb-6">Select specific topics you'd like to practice</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {focusAreaOptions.map(area => (
                <button
                  key={area}
                  onClick={() => handleFocusAreaToggle(area)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.focusAreas.includes(area)
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Options</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.includeCodeChallenge}
                  onChange={(e) => setSettings(prev => ({ ...prev, includeCodeChallenge: e.target.checked }))}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-3 text-gray-700">Include live coding challenge</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.includeBehavioral}
                  onChange={(e) => setSettings(prev => ({ ...prev, includeBehavioral: e.target.checked }))}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-3 text-gray-700">Include behavioral questions</span>
              </label>
            </div>
          </div>

          {/* Start Interview Button */}
          <div className="text-center">
            <button
              onClick={handleStartInterview}
              disabled={!settings.interviewType}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-lg font-semibold hover:from-orange-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-6 h-6" />
              <span>Start Mock Interview</span>
            </button>
            <p className="text-gray-500 text-sm mt-4">
              Duration: {settings.duration} minutes • Difficulty: {settings.difficulty}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
