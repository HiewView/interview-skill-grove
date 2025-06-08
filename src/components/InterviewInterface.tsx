
import React, { useState, useEffect } from 'react';
import PreInterviewSetup from './interview/PreInterviewSetup';
import InterviewRoom from './interview/InterviewRoom';
import { interviewService } from '../services/interviewService';
import { useToast } from '../hooks/use-toast';
import { isAuthenticated } from '../utils/apiUtils';
import { useNavigate } from 'react-router-dom';

const InterviewInterface: React.FC = () => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [firstQuestion, setFirstQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start an interview.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [navigate, toast]);

  const handleStartInterview = async (data: {
    name: string;
    role: string;
    experience: string;
    resumeText?: string;
    resumeFile?: File;
  }) => {
    setIsLoading(true);
    
    try {
      const response = await interviewService.startInterview({
        name: data.name,
        role: data.role,
        experience: data.experience,
        resume_text: data.resumeText,
        resume_file: data.resumeFile,
      });

      if (response.session_id && response.first_question) {
        setSessionId(response.session_id);
        setFirstQuestion(response.first_question);
        setIsSetupComplete(true);
        
        toast({
          title: "Interview Started",
          description: "Welcome to your AI interview session!",
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: "Failed to start interview. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewEnd = () => {
    setIsSetupComplete(false);
    setSessionId('');
    setFirstQuestion('');
    
    toast({
      title: "Interview Completed",
      description: "Thank you for completing the interview!",
    });
  };

  if (!isSetupComplete) {
    return (
      <PreInterviewSetup
        onStartInterview={handleStartInterview}
        isLoading={isLoading}
      />
    );
  }

  return (
    <InterviewRoom
      sessionId={sessionId}
      firstQuestion={firstQuestion}
      onInterviewEnd={handleInterviewEnd}
    />
  );
};

export default InterviewInterface;
