
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Send, Code } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import VideoFeed from '../ui/VideoFeed';
import { Textarea } from '../ui/textarea';
import { interviewService } from '../../services/interviewService';
import { speechUtils } from '../../utils/speechUtils';
import { useNavigate } from 'react-router-dom';
import ConversationDisplay from './ConversationDisplay';
import CodingChallenge from './CodingChallenge';
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
import { Button } from '../ui/button';

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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showCodingChallenge, setShowCodingChallenge] = useState(false);
  const [codingProblem, setCodingProblem] = useState<any>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  
  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      // Clean up text-to-speech on unmount
      speechUtils.cancel();
      stopRecording();
    };
  }, []);
  
  // Handle stream from VideoFeed
  const handleStreamReady = (stream: MediaStream) => {
    streamRef.current = stream;
    
    // Start listening automatically when stream is ready
    if (!isMuted) {
      startRecording();
    }
  };

  // Start Whisper-based recording
  const startRecording = () => {
    if (!streamRef.current) {
      toast({
        title: "Microphone Not Available",
        description: "Please enable your microphone to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0 || !isListening) return;

        setIsTranscribing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Send to server for transcription
          const result = await interviewService.transcribeAudio(audioBlob);
          
          if (result.transcript && result.transcript.trim() !== '') {
            // Update the current answer with the transcription
            setCurrentAnswer(prev => {
              const newAnswer = prev ? `${prev} ${result.transcript}` : result.transcript;
              return newAnswer.trim();
            });
            setInterimTranscript(result.transcript);
          }
          
          // Continue recording if still listening
          if (isListening) {
            audioChunksRef.current = [];
            startNextRecordingChunk();
            
            // Reset silence timer
            resetSilenceTimer();
          }
        } catch (error) {
          console.error("Error transcribing:", error);
          toast({
            title: "Transcription Error",
            description: "Failed to transcribe audio. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsTranscribing(false);
        }
      };

      // Start recording
      mediaRecorder.start(3000);  // Record in 3-second chunks
      setIsListening(true);
      
      // Set silence timer
      resetSilenceTimer();
      
      toast({
        title: "Listening",
        description: "Speak your answer. Using Whisper speech recognition.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: "Could not start recording. Please check your microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const startNextRecordingChunk = () => {
    if (mediaRecorderRef.current && isListening && !isMuted) {
      try {
        mediaRecorderRef.current.start(3000);
      } catch (error) {
        console.error("Error starting next recording chunk:", error);
      }
    }
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
    }
    
    silenceTimerRef.current = window.setTimeout(() => {
      if (currentAnswer.trim() || interimTranscript.trim()) {
        const finalAnswer = currentAnswer || interimTranscript;
        setCurrentAnswer(finalAnswer.trim());
        handleSubmitAnswer(finalAnswer.trim());
        setInterimTranscript('');
      } else if (isListening) {
        // If no answer but still listening, restart recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        } else {
          startRecording();
        }
      }
    }, 3000); // 3 seconds of silence before submitting
  };

  // Stop recording
  const stopRecording = () => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
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
          template_id: templateInfo?.id,
          use_whisper: true
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
                startRecording();
              }
            });
          } else if (!isMuted) {
            // Start listening immediately if TTS is disabled
            startRecording();
          }
          
          // Check if the question contains a coding challenge
          detectCodingChallenge(response.first_question);
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
      stopRecording();
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
  
  // Detect if a question contains a coding challenge
  const detectCodingChallenge = (question: string) => {
    const codingKeywords = [
      'coding challenge', 'coding problem', 'write a function', 'implement an algorithm',
      'solve this problem', 'programming challenge', 'algorithm question'
    ];
    
    const containsCodingChallenge = codingKeywords.some(keyword => 
      question.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (containsCodingChallenge) {
      // Extract problem details (this is a simple example, could be more sophisticated)
      const title = question.includes(':') ? 
        question.split(':')[1].trim().split('.')[0] : 
        "Coding Problem";
        
      setCodingProblem({
        title,
        description: question,
        example: "See problem description above for examples.",
        constraints: ["Complete the function as specified in the problem."]
      });
    }
  };
  
  // Submit answer to backend
  const handleSubmitAnswer = async (answerToSubmit?: string) => {
    const finalAnswer = answerToSubmit || currentAnswer;
    if (!finalAnswer.trim() || !sessionId) return;
    
    try {
      setIsLoading(true);
      stopRecording(); // Stop listening while processing
      
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
      setInterimTranscript('');
      
      // Update with new question
      if (response.next_question) {
        setCurrentQuestion(response.next_question);
        setTranscription(prev => [...prev, `AI: ${response.next_question}`]);
        
        // Check if the new question contains a coding challenge
        detectCodingChallenge(response.next_question);
        
        // Speak the next question if TTS is enabled
        if (ttsEnabled) {
          const speech = await speakText(response.next_question);
          // Start listening after AI finishes speaking
          speech.finished.then(() => {
            if (!isMuted) {
              startRecording();
            }
          });
        } else if (!isMuted) {
          // Start listening immediately if TTS is disabled
          startRecording();
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
        startRecording();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEndInterview = async () => {
    // Cancel any ongoing speech
    speechUtils.cancel();
    stopRecording();
    
    try {
      setIsLoading(true);
      
      // End interview on server
      const result = await interviewService.endInterview(sessionId);
      
      toast({
        title: "Interview Completed",
        description: "Your interview has been completed and recorded",
      });
      
      // Navigate to report page or dashboard
      if (result.report_id) {
        setTimeout(() => {
          navigate(`/report/${result.report_id}`);
        }, 1000);
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error("Error ending interview:", error);
      toast({
        title: "Error",
        description: "Failed to end the interview properly. Returning to home page.",
        variant: "destructive"
      });
      // Even if there's an error, navigate away from the interview
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } finally {
      setIsLoading(false);
      setEndInterviewOpen(false);
    }
  };
  
  // Toggle microphone
  const toggleMicrophone = () => {
    if (isMuted) {
      setIsMuted(false);
      startRecording();
    } else {
      setIsMuted(true);
      stopRecording();
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col h-full relative">
      {/* Coding Challenge Modal */}
      {showCodingChallenge && (
        <CodingChallenge 
          onClose={() => setShowCodingChallenge(false)} 
          problem={codingProblem}
        />
      )}
    
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
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCodingChallenge(true)}
                  disabled={!codingProblem}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Open Coding Editor
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transcription and controls */}
        <div className="flex flex-col space-y-6">
          <ConversationDisplay 
            transcription={transcription}
            interimTranscript={interimTranscript}
            isListening={isListening}
            currentQuestion={currentQuestion}
          />
          
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
