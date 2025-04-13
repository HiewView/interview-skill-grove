import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import VideoFeed from '../ui/VideoFeed';
import { Textarea } from '../ui/textarea';
import { interviewService } from '../../services/interviewService';
import { speechUtils } from '../../utils/speechUtils';
import { useNavigate } from 'react-router-dom';
import ConversationDisplay from './ConversationDisplay';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '../ui/alert-dialog';

interface InterviewInterfaceProps {
  sessionId: string;
  templateInfo?: any;
}

const InterviewInterface: React.FC<InterviewInterfaceProps> = ({ sessionId, templateInfo }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [endInterviewOpen, setEndInterviewOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      speechUtils.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);
  
  const handleStreamReady = (stream: MediaStream) => {
    streamRef.current = stream;
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (!isMuted) {
      recognitionRef.current = speechUtils.recognition.start(
        (transcript, isFinal) => {
          if (isFinal) {
            setCurrentAnswer(prev => {
              const newAnswer = prev ? `${prev} ${transcript}` : transcript;
              return newAnswer.trim();
            });
            setInterimTranscript('');
          } else {
            setInterimTranscript(transcript);
          }
        },
        () => {
          if (currentAnswer.trim() || interimTranscript.trim()) {
            const finalAnswer = currentAnswer || interimTranscript;
            setCurrentAnswer(finalAnswer.trim());
            handleSubmitAnswer(finalAnswer.trim());
            setInterimTranscript('');
          }
        }
      );
      setIsListening(true);
      toast({
        title: "Listening",
        description: "Speak your answer. Recording will stop after a pause in speech.",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };
  
  useEffect(() => {
    const initInterview = async () => {
      try {
        if (!sessionId) return;
        
        setIsLoading(true);
        
        const formData = JSON.parse(localStorage.getItem('interview_form_data') || '{}');
        
        const response = await interviewService.startInterview({
          session_id: sessionId,
          name: formData.name || "Candidate",
          role: formData.role || (templateInfo?.role || "Software Developer"),
          experience: formData.experience || "3",
          resume_text: formData.resumeText || "",
          organization_id: templateInfo?.organization_id,
          template_id: templateInfo?.id,
          use_whisper: true
        });
        
        if (response.first_question) {
          setCurrentQuestion(response.first_question);
          setTranscription([`AI: ${response.first_question}`]);
          
          if (ttsEnabled) {
            const speech = await speakText(response.first_question);
            speech.finished.then(() => {
              if (!isMuted) {
                startListening();
              }
            });
          } else if (!isMuted) {
            startListening();
          }
        }
      } catch (error) {
        console.error("Failed to initialize interview:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the interview service",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initInterview();

    return () => {
      stopListening();
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
    };
  }, [sessionId, templateInfo]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer < 600) {
        setTimer(prev => prev + 1);
        
        setProgress(Math.min((timer / 600) * 100, 100));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer]);
  
  const speakText = async (text: string) => {
    speechUtils.cancel();
    const voice = speechUtils.getVoiceByLang('en-US');
    return speechUtils.speak(text, voice, {
      rate: 1,
      pitch: 1,
      volume: 1
    });
  };
  
  const handleSubmitAnswer = async (answerToSubmit?: string) => {
    const finalAnswer = answerToSubmit || currentAnswer;
    if (!finalAnswer.trim() || !sessionId) return;
    
    try {
      setIsLoading(true);
      stopListening();
      
      const userAnswer = `You: ${finalAnswer}`;
      setTranscription(prev => [...prev, userAnswer]);
      
      const response = await interviewService.submitAnswer({
        session_id: sessionId,
        answer: finalAnswer
      });
      
      setCurrentAnswer('');
      
      if (response.next_question) {
        setCurrentQuestion(response.next_question);
        setTranscription(prev => [...prev, `AI: ${response.next_question}`]);
        
        if (ttsEnabled) {
          const speech = await speakText(response.next_question);
          speech.finished.then(() => {
            if (!isMuted) {
              startListening();
            }
          });
        } else if (!isMuted) {
          startListening();
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your answer",
        variant: "destructive"
      });
      if (!isMuted) {
        startListening();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEndInterview = async () => {
    speechUtils.cancel();
    stopListening();
    
    try {
      setIsLoading(true);
      
      let result;
      try {
        result = await interviewService.endInterview(sessionId);
      } catch (error) {
        console.error("Error from server:", error);
        toast({
          title: "Interview Completed",
          description: "Your interview session has ended",
        });
        setTimeout(() => navigate('/'), 1000);
        return;
      }
      
      toast({
        title: "Interview Completed",
        description: "Your interview has been completed and recorded",
      });
      
      if (result && result.report_id) {
        setTimeout(() => {
          navigate(`/report/${result.report_id}`);
        }, 1000);
      } else {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error("Error ending interview:", error);
      toast({
        title: "Error",
        description: "Failed to end the interview, but you can still leave.",
        variant: "destructive"
      });
      setTimeout(() => navigate('/'), 1000);
    } finally {
      setIsLoading(false);
      setEndInterviewOpen(false);
    }
  };
  
  const toggleMicrophone = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
    } else {
      setIsMuted(true);
      stopListening();
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Interview Progress</span>
          <span className="text-sm font-medium">{formatTime(timer)}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <div className="flex flex-col space-y-6">
          <VideoFeed 
            className="h-72 md:h-96" 
            muted={isMuted} 
            onStreamReady={handleStreamReady}
          />
          
          <div className="glass-card h-72 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-lg font-medium">AI Interviewer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading ? "Processing..." : (isListening ? "Listening..." : "Ready")}
              </p>
              
              <div className="mt-4 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Text-to-Speech</span>
                  <div className="ml-2">
                    <input 
                      type="checkbox" 
                      id="tts-toggle"
                      checked={ttsEnabled}
                      onChange={() => setTtsEnabled(!ttsEnabled)}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="tts-toggle"
                      className={`block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out relative cursor-pointer ${ttsEnabled ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span 
                        className={`block w-4 h-4 rounded-full bg-white absolute transition-transform duration-200 ease-in-out ${ttsEnabled ? 'transform translate-x-5' : 'transform translate-x-1'}`}
                        style={{ top: '2px' }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-6">
          <ConversationDisplay
            transcription={transcription}
            interimTranscript={interimTranscript}
            isListening={isListening}
            currentQuestion={currentQuestion}
          />
          
          <div className="flex flex-col space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={isListening ? "Listening to your voice..." : "Type your answer here..."}
                className="flex-1 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitAnswer();
                  }
                }}
              />
              <button 
                className="p-3 bg-primary text-primary-foreground rounded-md self-end hover:bg-primary/90 transition-colors"
                onClick={() => handleSubmitAnswer()}
                disabled={isLoading || (!currentAnswer.trim() && !interimTranscript.trim())}
              >
                <Send size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button 
                className={`p-4 rounded-full ${
                  isMuted 
                    ? 'bg-destructive text-destructive-foreground' 
                    : isListening 
                      ? 'bg-green-500 text-white animate-pulse' 
                      : 'bg-muted hover:bg-muted/80'
                } transition-all duration-300`}
                onClick={toggleMicrophone}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <button 
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => setEndInterviewOpen(true)}
                disabled={isLoading}
              >
                End Interview
              </button>
              
              <button className="p-4 rounded-full bg-muted hover:bg-muted/80">
                <AlertCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <AlertDialog open={endInterviewOpen} onOpenChange={setEndInterviewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this interview? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEndInterview} 
              disabled={isLoading}
              className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isLoading ? "Ending..." : "Yes, end interview"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InterviewInterface;
