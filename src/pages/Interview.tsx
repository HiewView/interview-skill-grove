
import React from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import InterviewRoom from '../components/interview/InterviewRoom';
import { useToast } from '../hooks/use-toast';

const Interview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessionId, firstQuestion } = location.state || {};

  const handleInterviewEnd = () => {
    toast({
      title: "Interview Completed",
      description: "Thank you! You will be redirected to the dashboard.",
    });
    // The navigation is handled inside InterviewRoom, but this is a good fallback.
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (!sessionId || !firstQuestion) {
    // If someone lands here directly, redirect them to the setup page
    return <Navigate to="/candidate/mock-interview" replace />;
  }

  return (
    <InterviewRoom
      sessionId={sessionId}
      firstQuestion={firstQuestion}
      onInterviewEnd={handleInterviewEnd}
    />
  );
};

export default Interview;
