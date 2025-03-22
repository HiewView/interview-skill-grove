
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, BarChart, LineChart } from 'lucide-react';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';

const Index: React.FC = () => {
  return (
    <div className="page-transition min-h-screen">
      <Hero
        title="AI-Powered Interview Experience"
        subtitle="Practice & evaluate your interview skills with real-time AI-driven assessment."
        cta={
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              to="/interview"
              className="btn-primary inline-flex items-center gap-2"
            >
              Start as a Candidate
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/organization"
              className="btn-secondary inline-flex items-center gap-2"
            >
              Start as an Organization
              <ArrowRight size={16} />
            </Link>
          </div>
        }
      />

      <div className="page-section bg-muted/30">
        <div className="page-container">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">
            Our platform offers a comprehensive set of tools for interview preparation and assessment
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <FeatureCard
              title="AI-powered Interviews"
              description="Experience realistic interviews with our advanced AI interviewer that adapts to your responses."
              icon={Brain}
            />
            
            <FeatureCard
              title="Real-time Feedback"
              description="Get instant insights on your performance with detailed analytics and improvement suggestions."
              icon={BarChart}
            />
            
            <FeatureCard
              title="Performance Analysis"
              description="Review comprehensive reports highlighting your strengths and areas for improvement."
              icon={LineChart}
            />
          </div>
        </div>
      </div>

      <div className="page-section">
        <div className="page-container">
          <div className="glass-card p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  For Organizations & Universities
                </h2>
                <p className="text-lg mb-6">
                  Streamline your hiring process with our AI-powered interview platform.
                  Create custom interview templates, manage candidates, and get detailed reports.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">✓</span>
                    Customizable interview templates
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">✓</span>
                    Bulk candidate management
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">✓</span>
                    Detailed performance analytics
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">✓</span>
                    Automated interview scheduling
                  </li>
                </ul>
                <Link
                  to="/organization"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="bg-primary/5 rounded-lg p-8 border border-primary/10">
                <h3 className="text-xl font-medium mb-4">For Hiring Teams</h3>
                <p className="mb-6">
                  Create customized interview experiences tailored to your specific roles and requirements.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-background p-4 rounded-md">
                    <h4 className="font-medium">1. Create Role Templates</h4>
                    <p className="text-sm text-muted-foreground">
                      Define specific questions and evaluation criteria
                    </p>
                  </div>
                  
                  <div className="bg-background p-4 rounded-md">
                    <h4 className="font-medium">2. Add Candidates</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload candidate emails individually or in bulk
                    </p>
                  </div>
                  
                  <div className="bg-background p-4 rounded-md">
                    <h4 className="font-medium">3. Schedule Interviews</h4>
                    <p className="text-sm text-muted-foreground">
                      Candidates receive automated invitations
                    </p>
                  </div>
                  
                  <div className="bg-background p-4 rounded-md">
                    <h4 className="font-medium">4. Review Results</h4>
                    <p className="text-sm text-muted-foreground">
                      Get comprehensive reports on candidate performance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
