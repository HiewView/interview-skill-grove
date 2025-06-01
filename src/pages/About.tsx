
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Award, Globe } from 'lucide-react';

const About: React.FC = () => {
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
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">HireView</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            We're revolutionizing the hiring process with AI-powered interviews that provide fair, 
            consistent, and insightful candidate evaluations.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To eliminate bias and inefficiency in hiring by providing AI-powered interview 
                solutions that evaluate candidates fairly and comprehensively.
              </p>
              <p className="text-lg text-gray-600">
                We believe every candidate deserves a fair chance to showcase their skills, 
                and every organization deserves the best talent.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 text-white">
              <Target className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-orange-100">
                A world where hiring decisions are based purely on merit, skills, and potential, 
                free from unconscious bias and human limitations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border border-gray-200 hover:border-orange-300 transition-colors">
              <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fairness</h3>
              <p className="text-gray-600">
                Every candidate gets the same opportunity to demonstrate their abilities, 
                regardless of background or bias.
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl border border-gray-200 hover:border-orange-300 transition-colors">
              <Award className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest standards in AI technology and user experience 
                to deliver exceptional results.
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl border border-gray-200 hover:border-orange-300 transition-colors">
              <Globe className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                Continuously pushing the boundaries of what's possible in interview 
                technology and candidate assessment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Built by Experts</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Our team combines decades of experience in AI, HR technology, and software engineering 
            to create the most advanced interview platform available.
          </p>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">50+</div>
                <div className="text-gray-600">AI Engineers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">100K+</div>
                <div className="text-gray-600">Interviews Conducted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">500+</div>
                <div className="text-gray-600">Organizations Trust Us</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
