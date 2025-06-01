
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, BarChart, Shield, Code, Zap, Users, CheckCircle, Play } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Features</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Discover the comprehensive suite of AI-powered tools that make HireView 
            the most advanced interview platform available.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Driven Interviews"
              description="Intelligent question generation that adapts to candidate responses and role requirements in real-time."
              features={[
                "Dynamic question flow",
                "Context-aware follow-ups",
                "Role-specific assessments",
                "Natural conversation AI"
              ]}
            />
            <FeatureCard
              icon={BarChart}
              title="Real-time Analytics"
              description="Comprehensive assessment of technical skills, communication, and problem-solving abilities with instant insights."
              features={[
                "Performance metrics",
                "Skill gap analysis",
                "Communication scoring",
                "Behavioral insights"
              ]}
            />
            <FeatureCard
              icon={Shield}
              title="Integrity Monitoring"
              description="Advanced malpractice detection including tab switching, screen recording, and behavioral analysis."
              features={[
                "Tab switch detection",
                "Screen monitoring",
                "Audio analysis",
                "Behavioral patterns"
              ]}
            />
            <FeatureCard
              icon={Code}
              title="Code Challenges"
              description="Integrated development environment with syntax highlighting for comprehensive technical assessments."
              features={[
                "Multiple languages",
                "Real-time compilation",
                "Code quality analysis",
                "Debugging tools"
              ]}
            />
            <FeatureCard
              icon={Zap}
              title="Speech Technology"
              description="Industry-leading speech-to-text and text-to-speech for natural conversation flow and analysis."
              features={[
                "Real-time transcription",
                "Accent recognition",
                "Emotion detection",
                "Voice clarity analysis"
              ]}
            />
            <FeatureCard
              icon={Users}
              title="Multi-Role Support"
              description="Tailored experiences for candidates, organizations, and educational institutions with role-based dashboards."
              features={[
                "Candidate portal",
                "HR dashboard",
                "Admin controls",
                "Bulk management"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Advanced Capabilities
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Resume-Based Questions</h3>
                  <p className="text-gray-600">AI analyzes uploaded resumes to generate personalized questions based on experience and skills.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Adaptive Difficulty</h3>
                  <p className="text-gray-600">Questions automatically adjust in complexity based on candidate performance and responses.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Modal Assessment</h3>
                  <p className="text-gray-600">Combines verbal responses, code quality, and behavioral cues for comprehensive evaluation.</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8">
              <div className="aspect-video bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">See It In Action</h3>
              <p className="text-gray-600 mb-6">
                Watch how our AI conducts natural, engaging interviews that feel like conversations with a human expert.
              </p>
              <Link 
                to="/demo"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full font-medium hover:from-orange-500 hover:to-red-600 transition-all"
              >
                <span>Try Demo</span>
                <Play className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, features }) => {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Features;
