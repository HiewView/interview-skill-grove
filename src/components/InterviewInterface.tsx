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
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [silenceTimeout, setSilenceTimeout] = useState<NodeJS.Timeout | null>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      speechUtils.cancel();
      stopRecording();
    };
  }, []);
  
  const handleStreamReady = (stream: MediaStream) => {
    streamRef.current = stream;
  };

  const startRecording = () => {
    if (!streamRef.current) {
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check your permissions.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Clear any existing recording
      audioChunksRef.current = [];
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        
        // Process audio when recording stops
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Clear for next recording
        audioChunksRef.current = [];
        
        // Show processing message
        setInterimTranscript('Processing audio...');
        
        try {
          // Use Whisper transcription
          const result = await interviewService.transcribeAudio(audioBlob);
          const transcript = result.transcript.trim();
          
          if (transcript) {
            // Update the answer with the transcription
            setCurrentAnswer(prev => {
              const newAnswer = prev ? `${prev} ${transcript}` : transcript;
              return newAnswer.trim();
            });
            
            // If silence was detected (automatic submission), submit the answer
            if (!isRecording) {
              handleSubmitAnswer(transcript);
            }
          }
        } catch (error) {
          console.error("Transcription error:", error);
          toast({
            title: "Transcription Error",
            description: "Failed to transcribe audio. Please try again or type your answer.",
            variant: "destructive"
          });
        } finally {
          setInterimTranscript('');
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Set up silence detection timeout
      const timeout = setTimeout(() => {
        if (isRecording && mediaRecorderRef.current) {
          stopRecording(true); // true indicates it was stopped due to silence
        }
      }, 3000); // 3 seconds of silence
      
      setSilenceTimeout(timeout);
      
      toast({
        title: "Recording",
        description: "Speak your answer. Recording will automatically stop after 3 seconds of silence.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check your microphone.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = (fromSilence = false) => {
    // Clear silence timeout
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
      setSilenceTimeout(null);
    }
    
    // Stop media recorder if it exists and is recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
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
                startRecording();
              }
            });
          } else if (!isMuted) {
            startRecording();
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
      stopRecording();
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
      stopRecording();
      
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
              startRecording();
            }
          });
        } else if (!isMuted) {
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
      if (!isMuted) {
        startRecording();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEndInterview = async () => {
    try {
      speechUtils.cancel();
      stopRecording();
      
      // Call the end interview API
      const result = await interviewService.endInterview(sessionId);
      
      toast({
        title: "Interview Completed",
        description: result.report_id ? 
          "Your interview has been completed and a report has been generated." : 
          "Your interview has been completed.",
      });
      
      // If we have a report ID, redirect to the report page
      if (result.report_id) {
        setTimeout(() => {
          window.location.href = `/report/${result.report_id}`;
        }, 2000);
      } else {
        // Otherwise go to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      console.error("Error ending interview:", error);
      toast({
        title: "Error",
        description: "There was a problem ending the interview, but your progress has been saved.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  };
  
  const toggleMicrophone = () => {
    if (isMuted) {
      setIsMuted(false);
      startRecording();
    } else {
      setIsMuted(true);
      stopRecording();
    }
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
                {isLoading ? "Processing..." : (isRecording ? "Recording..." : "Ready")}
              </p>
              
              <div className="mt-4 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Text-to-Speech</span>
                  <Switch 
                    checked={ttsEnabled} 
                    onCheckedChange={setTtsEnabled} 
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
              
              {isRecording && (
                <div className="p-3 rounded-lg bg-secondary/50 text-foreground ml-12 animate-pulse">
                  <p>Recording...</p>
                </div>
              )}
              
              {interimTranscript && !isRecording && (
                <div className="p-3 rounded-lg bg-secondary/50 text-foreground ml-12">
                  <p>{interimTranscript}</p>
                </div>
              )}
              
              {transcription.length === 0 && !isRecording && !interimTranscript && (
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
                placeholder={isRecording ? "Recording..." : "Type your answer here..."}
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
                disabled={isLoading || !currentAnswer.trim()}
              >
                <Send size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button 
                className={`p-4 rounded-full ${
                  isMuted 
                    ? 'bg-destructive text-destructive-foreground' 
                    : isRecording 
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
