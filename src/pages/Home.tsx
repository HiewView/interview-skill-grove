
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, BarChart, Shield, Code, Users, Zap, CheckCircle, Play } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HireView</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-500 hover:to-red-600 transition-all font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Atlas-Whole-Code
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 block">
                  Meets Human
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience the future of hiring with our intelligent interview platform. 
                AI-powered assessments that adapt to your responses in real-time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/candidate-signup"
                  className="group bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-orange-500 hover:to-red-600 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Start as Candidate</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/organization-signup"
                  className="group bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold border-2 border-gray-200 hover:border-orange-300 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Start as Organization</span>
                  <Users className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why HireView Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why HireView?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Intelligent AI meets
                  real-world impact
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI doesn't just ask questions—it understands context, adapts to responses, 
                  and provides insights that matter. Experience interviews that feel natural while 
                  delivering data-driven results.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <FeatureItem
                title="Dynamic Question Generation"
                description="Questions adapt based on your responses and background"
              />
              <FeatureItem
                title="Real-time Performance Analysis"
                description="Instant feedback on technical and soft skills"
              />
              <FeatureItem
                title="Malpractice Detection"
                description="Advanced monitoring ensures interview integrity"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Advanced Intelligence.
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                {" "}Human-like Intuition.
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of interview technology with comprehensive AI-powered tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Driven Interviews"
              description="Intelligent question generation that adapts to candidate responses and role requirements"
              gradient="from-blue-500 to-blue-600"
            />
            <FeatureCard
              icon={BarChart}
              title="Real-time Analytics"
              description="Comprehensive assessment of technical skills, communication, and problem-solving abilities"
              gradient="from-green-500 to-green-600"
            />
            <FeatureCard
              icon={Shield}
              title="Integrity Monitoring"
              description="Advanced malpractice detection including tab switching and behavioral analysis"
              gradient="from-purple-500 to-purple-600"
            />
            <FeatureCard
              icon={Code}
              title="Code Challenges"
              description="Integrated development environment with syntax highlighting for technical assessments"
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={Zap}
              title="Speech Technology"
              description="Industry-leading speech-to-text and text-to-speech for natural conversation flow"
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={Users}
              title="Multi-Role Support"
              description="Tailored experiences for candidates, organizations, and educational institutions"
              gradient="from-indigo-500 to-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-400 to-red-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Interview Experience?
          </h2>
          <p className="text-xl text-orange-100 mb-12">
            Join thousands of professionals and organizations already using HireView
          </p>
          
          <Link
            to="/signup"
            className="inline-flex items-center space-x-2 bg-white text-orange-500 px-12 py-4 rounded-full text-xl font-semibold hover:bg-orange-50 transition-colors"
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">HireView</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 HireView. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, gradient }) => {
  return (
    <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

interface FeatureItemProps {
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ title, description }) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 mt-1">
        <CheckCircle className="w-4 h-4 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default Home;
