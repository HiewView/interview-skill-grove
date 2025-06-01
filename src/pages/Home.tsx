
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, BarChart, Shield, Code, Users, Zap } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-yellow-500">HireView</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-yellow-500 transition-colors">Features</a>
              <a href="#how-it-works" className="text-white/80 hover:text-yellow-500 transition-colors">How it Works</a>
              <a href="#pricing" className="text-white/80 hover:text-yellow-500 transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-white/80 hover:text-yellow-500 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered
              <span className="text-yellow-500">
                {" "}Interview{" "}
              </span>
              Experience
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 leading-relaxed">
              Practice & evaluate your interview skills with real-time AI-driven assessment. 
              Experience the future of hiring with our intelligent interview platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/candidate-signup"
                className="group bg-yellow-500 text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start as Candidate</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/organization-signup"
                className="group bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl text-lg font-semibold border border-yellow-500/30 hover:bg-yellow-500/10 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start as Organization</span>
                <Users className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Experience the next generation of interview technology with our comprehensive suite of AI-powered tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Driven Questions"
              description="Dynamic question generation based on your responses, resume, and role requirements"
              bgColor="bg-yellow-500"
            />
            <FeatureCard
              icon={BarChart}
              title="Real-time Analysis"
              description="Instant feedback on technical skills, communication, and problem-solving abilities"
              bgColor="bg-yellow-500"
            />
            <FeatureCard
              icon={Shield}
              title="Malpractice Detection"
              description="Advanced monitoring for tab switching, lip-sync analysis, and integrity verification"
              bgColor="bg-yellow-500"
            />
            <FeatureCard
              icon={Code}
              title="Code Challenges"
              description="Built-in code editor with syntax highlighting for technical assessments"
              bgColor="bg-yellow-500"
            />
            <FeatureCard
              icon={Zap}
              title="Speech Technology"
              description="Industry-leading STT and TTS for natural conversation flow"
              bgColor="bg-yellow-500"
            />
            <FeatureCard
              icon={Users}
              title="Multi-Role Support"
              description="Tailored experiences for candidates, organizations, and universities"
              bgColor="bg-yellow-500"
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Simple, intuitive, and powerful - get started in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <ProcessStep
                number="01"
                title="Profile Setup"
                description="Create your profile, upload resume, and set interview preferences"
              />
              <ProcessStep
                number="02"
                title="AI Interview"
                description="Engage with our AI interviewer through real-time conversation"
              />
              <ProcessStep
                number="03"
                title="Performance Report"
                description="Receive detailed analytics and actionable feedback"
              />
            </div>
            
            <div className="relative">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="aspect-video bg-black/30 rounded-xl flex items-center justify-center">
                  <div className="text-white/60 text-lg">Interview Demo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-yellow-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Interview Experience?
          </h2>
          <p className="text-xl text-white/80 mb-12">
            Join thousands of professionals and organizations already using HireView
          </p>
          
          <Link
            to="/signup"
            className="inline-flex items-center space-x-2 bg-yellow-500 text-black px-12 py-4 rounded-xl text-xl font-semibold hover:bg-yellow-400 transition-colors"
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-yellow-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-yellow-500">HireView</span>
            </div>
            
            <div className="text-white/60 text-sm">
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
  bgColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, bgColor }) => {
  return (
    <div className="group p-6 rounded-2xl bg-gray-900 border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-black" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  );
};

interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description }) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
        <span className="text-black font-bold">{number}</span>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/70">{description}</p>
      </div>
    </div>
  );
};

export default Home;
