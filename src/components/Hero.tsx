
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
  cta: ReactNode;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle, cta }) => {
  return (
    <section className="relative pt-32 pb-20 md:py-40 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="page-container relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in slide-in-from-bottom-4 duration-300">
            <span>AI-Powered Interview Platform</span>
          </div>
          
          <h1 className="font-medium text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 animate-in slide-in-from-bottom-5 duration-500 mb-6">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mb-10 animate-in slide-in-from-bottom-6 duration-700">
            {subtitle}
          </p>
          
          <div className="animate-in slide-in-from-bottom-7 duration-1000">
            {cta}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
