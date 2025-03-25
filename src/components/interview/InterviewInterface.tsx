import React, { useState, useEffect, useRef } from 'react';
import { toast } from "@/hooks/use-toast";
import VideoFeed from '../ui/VideoFeed';
import { interviewService } from '../../services/interviewService';
import { speechUtils } from '../../utils/speechUtils';
import ProgressHeader from './ProgressHeader';
import AIInterviewer from './AIInterviewer';
import ConversationDisplay from './ConversationDisplay';
import AnswerInput from './AnswerInput';

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  
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
          console.log("Silence detected, submitting answer");
          if (currentAnswer.trim() || interimTranscript.trim()) {
            const finalAnswer = currentAnswer || interimTranscript;
            setCurrentAnswer(finalAnswer.trim());
            handleSubmitAnswer(finalAnswer.trim());
            setInterimTranscript('');
          }
        },
        2000, // Reduced silence threshold to 2 seconds (from 3)
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
  
  const handleEndInterview = () => {
    // Cancel any ongoing speech
    speechUtils.cancel();
    stopListening();
    
    // In a real app, this would save the interview results
    toast({
      title: "Interview Completed",
      description: "Your interview has been completed and recorded",
    });
    
    // Redirect to a thank you or results page
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
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
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with progress and timer */}
      <ProgressHeader timer={timer} progress={progress} />
      
      {/* Main interview interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Video feeds */}
        <div className="flex flex-col space-y-6">
          <VideoFeed 
            className="h-72 md:h-96" 
            muted={isMuted} 
            onStreamReady={handleStreamReady}
          />
          
          <AIInterviewer 
            isLoading={isLoading}
            isListening={isListening}
            ttsEnabled={ttsEnabled}
            setTtsEnabled={setTtsEnabled}
            useWhisper={useWhisper}
            toggleWhisper={toggleWhisper}
          />
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
          <AnswerInput
            currentAnswer={currentAnswer}
            setCurrentAnswer={setCurrentAnswer}
            handleSubmitAnswer={handleSubmitAnswer}
            isLoading={isLoading}
            isMuted={isMuted}
            isListening={isListening}
            interimTranscript={interimTranscript}
            toggleMicrophone={toggleMicrophone}
            handleEndInterview={handleEndInterview}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewInterface;
