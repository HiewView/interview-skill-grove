import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import VideoFeed from './ui/VideoFeed';
import { Textarea } from './ui/textarea';
import { interviewService } from '../services/interviewService';
import { speechUtils } from '../utils/speechUtils';
import { Switch } from './ui/switch';

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
  const [useWhisper, setUseWhisper] = useState(true);
  const conversationRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      speechUtils.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);
  
  const handleStreamReady = (stream: MediaStream) => {
    streamRef.current = stream;
  };

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
        },
        3000
      );
      setIsListening(true);
      toast({
        title: "Listening",
        description: `Speak your answer. Using ${useWhisper ? "Whisper" : "browser"} speech recognition.`,
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
          template_id: templateInfo?.id
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
  
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [transcription]);
  
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
  
  const handleEndInterview = () => {
    speechUtils.cancel();
    stopListening();
    
    toast({
      title: "Interview Completed",
      description: "Your interview has been completed and recorded",
    });
    
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
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
  
  const toggleWhisper = () => {
    stopListening();
    setUseWhisper(!useWhisper);
    
    setTimeout(() => {
      if (!isMuted) {
        startListening();
      }
    }, 300);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col h-full">
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
                onClick={handleEndInterview}
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
    </div>
  );
};

export default InterviewInterface;
