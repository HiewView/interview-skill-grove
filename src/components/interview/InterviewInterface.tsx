
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import VideoFeed from '../ui/VideoFeed';
import { Textarea } from '../ui/textarea';
import { interviewService } from '../../services/interviewService';
import { speechUtils } from '../../utils/speechUtils';
import { Switch } from '../ui/switch';
import { useNavigate } from 'react-router-dom';
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
  const [useWhisper, setUseWhisper] = useState(true); // Default to using Whisper
  const [endInterviewOpen, setEndInterviewOpen] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const navigate = useNavigate();
  
  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      // Clean up text-to-speech on unmount
      speechUtils.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);
  
  // Handle stream from VideoFeed
  const handleStreamReady = (stream: MediaStream) => {
    streamRef.current = stream;
  };

  // Start speech recognition
  const startListening = () => {
    if (!useWhisper && !speechUtils.recognition.isSupported()) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Whisper instead.",
        variant: "destructive"
      });
      setUseWhisper(true);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    // Only start if not muted
    if (!isMuted) {
      recognitionRef.current = speechUtils.recognition.start(
        // On result
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
        // On silence (user stopped speaking)
        () => {
          if (currentAnswer.trim() || interimTranscript.trim()) {
            const finalAnswer = currentAnswer || interimTranscript;
            setCurrentAnswer(finalAnswer.trim());
            handleSubmitAnswer(finalAnswer.trim());
            setInterimTranscript('');
          }
        },
        3000, // 3 seconds of silence threshold
        useWhisper // Use Whisper if enabled
      );
      setIsListening(true);
      toast({
        title: "Listening",
        description: `Speak your answer. Using ${useWhisper ? "Whisper" : "browser"} speech recognition.`,
      });
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };
  
  // Initialize interview session
  useEffect(() => {
    const initInterview = async () => {
      try {
        if (!sessionId) return;
        
        setIsLoading(true);
        
        // Get candidate name from local storage if available
        const formData = JSON.parse(localStorage.getItem('interview_form_data') || '{}');
        
        const response = await interviewService.startInterview({
          session_id: sessionId,
          name: formData.name || "Candidate",
          role: formData.role || (templateInfo?.role || "Software Developer"),
          experience: formData.experience || "3",
          resume_text: formData.resumeText || "",
          organization_id: templateInfo?.organization_id,
          template_id: templateInfo?.id
        });
        
        if (response.first_question) {
          setCurrentQuestion(response.first_question);
          setTranscription([`AI: ${response.first_question}`]);
          
          // Speak the first question if TTS is enabled
          if (ttsEnabled) {
            const speech = await speakText(response.first_question);
            // Start listening after AI finishes speaking
            speech.finished.then(() => {
              if (!isMuted) {
                startListening();
              }
            });
          } else if (!isMuted) {
            // Start listening immediately if TTS is disabled
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

    // Clean up when component unmounts
    return () => {
      stopListening();
    };
  }, [sessionId, templateInfo]);
  
  // Interview timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer < 600) { // 10 minutes in seconds
        setTimer(prev => prev + 1);
        
        // Update progress based on timer
        setProgress(Math.min((timer / 600) * 100, 100));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer]);
  
  // Scroll to bottom of conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [transcription]);
  
  // Text-to-speech functionality
  const speakText = async (text: string) => {
    // Cancel any ongoing speech
    speechUtils.cancel();
    
    // Get a voice
    const voice = speechUtils.getVoiceByLang('en-US');
    
    // Speak the text
    return speechUtils.speak(text, voice, {
      rate: 1,
      pitch: 1,
      volume: 1
    });
  };
  
  // Submit answer to backend
  const handleSubmitAnswer = async (answerToSubmit?: string) => {
    const finalAnswer = answerToSubmit || currentAnswer;
    if (!finalAnswer.trim() || !sessionId) return;
    
    try {
      setIsLoading(true);
      stopListening(); // Stop listening while processing
      
      // Add user's answer to transcription
      const userAnswer = `You: ${finalAnswer}`;
      setTranscription(prev => [...prev, userAnswer]);
      
      // Submit to backend
      const response = await interviewService.submitAnswer({
        session_id: sessionId,
        answer: finalAnswer
      });
      
      // Clear answer field after submission
      setCurrentAnswer('');
      
      // Update with new question
      if (response.next_question) {
        setCurrentQuestion(response.next_question);
        setTranscription(prev => [...prev, `AI: ${response.next_question}`]);
        
        // Speak the next question if TTS is enabled
        if (ttsEnabled) {
          const speech = await speakText(response.next_question);
          // Start listening after AI finishes speaking
          speech.finished.then(() => {
            if (!isMuted) {
              startListening();
            }
          });
        } else if (!isMuted) {
          // Start listening immediately if TTS is disabled
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
      // Restart listening
      if (!isMuted) {
        startListening();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEndInterview = async () => {
    // Cancel any ongoing speech
    speechUtils.cancel();
    stopListening();
    
    try {
      setIsLoading(true);
      
      // End interview on server
      const result = await interviewService.endInterview(sessionId);
      
      toast({
        title: "Interview Completed",
        description: "Your interview has been completed and recorded",
      });
      
      // Navigate to report page
      if (result.report_id) {
        setTimeout(() => {
          navigate(`/report/${result.report_id}`);
        }, 1000);
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error("Error ending interview:", error);
      toast({
        title: "Error",
        description: "Failed to end the interview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setEndInterviewOpen(false);
    }
  };
  
  // Toggle microphone
  const toggleMicrophone = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
    } else {
      setIsMuted(true);
      stopListening();
    }
  };
  
  // Toggle between Whisper and browser recognition
  const toggleWhisper = () => {
    stopListening();
    setUseWhisper(!useWhisper);
    
    // Restart listening with new recognition type
    setTimeout(() => {
      if (!isMuted) {
        startListening();
      }
    }, 300);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with progress and timer */}
      <div className="px-6 py-4 border-b">
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
      
      {/* Main interview interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Video feeds */}
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
                  <span className="text-sm">TTS</span>
                  <Switch 
                    checked={ttsEnabled} 
                    onCheckedChange={setTtsEnabled} 
                  />
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">Whisper STT</span>
                  <Switch 
                    checked={useWhisper} 
                    onCheckedChange={toggleWhisper} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transcription and controls */}
        <div className="flex flex-col space-y-6">
          <div className="flex-1 glass-card overflow-hidden flex flex-col">
            <h3 className="text-lg font-medium mb-4">Current Question</h3>
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-lg">{currentQuestion || "Loading..."}</p>
            </div>
            
            <h3 className="text-lg font-medium mb-2">Conversation</h3>
            <div 
              ref={conversationRef}
              className="flex-1 overflow-y-auto rounded-lg bg-muted/30 p-4 space-y-3"
            >
              {transcription.map((text, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    text.startsWith('AI:') 
                      ? 'bg-primary/10 text-foreground mr-12' 
                      : 'bg-secondary text-foreground ml-12'
                  } animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <p>{text}</p>
                </div>
              ))}
              
              {isListening && interimTranscript && (
                <div className="p-3 rounded-lg bg-secondary/50 text-foreground ml-12 animate-pulse">
                  <p>You: {interimTranscript}</p>
                </div>
              )}
              
              {transcription.length === 0 && !isListening && (
                <div className="text-center p-6 text-muted-foreground">
                  <p>Your conversation will appear here</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Input area */}
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
      
      {/* End Interview Confirmation Dialog */}
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
