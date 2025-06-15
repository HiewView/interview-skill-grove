import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Mic, MicOff, Video, VideoOff, Clock, PhoneOff } from 'lucide-react';
import VideoFeed from '../ui/VideoFeed';
import { speechService } from '../../services/speechService';
import { audioRecordingService } from '../../services/audioRecordingService';
import { interviewService } from '../../services/interviewService';
import { useNavigate } from 'react-router-dom';

interface InterviewRoomProps {
  sessionId: string;
  firstQuestion: string;
  onInterviewEnd: () => void;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ 
  sessionId, 
  firstQuestion, 
  onInterviewEnd 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(firstQuestion);
  const [conversation, setConversation] = useState<Array<{ type: 'ai' | 'user'; text: string }>>([
    { type: 'ai', text: firstQuestion }
  ]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const navigate = useNavigate();
  const conversationRef = useRef<HTMLDivElement>(null);

  // Timer for interview duration
  useEffect(() => {
    const timer = setInterval(() => {
      setInterviewTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  // Start with AI speaking the first question
  useEffect(() => {
    const speakFirstQuestion = async () => {
      if (firstQuestion) {
        setIsAISpeaking(true);
        try {
          await speechService.speak(firstQuestion);
        } catch (error) {
          console.error('Error speaking first question:', error);
        } finally {
          setIsAISpeaking(false);
        }
      }
    };

    speakFirstQuestion();
  }, [firstQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startListening = async () => {
    if (!isMicOn || isAISpeaking || isProcessing) return;

    try {
      setIsListening(true);
      setCurrentTranscript('');
      await audioRecordingService.startRecording();
      
      // Set a timeout to automatically stop recording after 30 seconds
      setTimeout(() => {
        if (audioRecordingService.isRecording()) {
          stopListening();
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      setIsProcessing(true);
      
      const audioBlob = await audioRecordingService.stopRecording();
      
      // Transcribe audio
      const { transcript } = await interviewService.transcribeAudio(audioBlob);
      setCurrentTranscript(transcript);
      
      // Add user response to conversation
      setConversation(prev => [...prev, { type: 'user', text: transcript }]);
      
      // Submit answer and get next question
      const response = await interviewService.submitAnswer({
        session_id: sessionId,
        answer: transcript,
        question: currentQuestion,
      });

      if (response.is_complete) {
        // Interview is complete
        handleEndInterview();
        return;
      }

      if (response.next_question) {
        setCurrentQuestion(response.next_question);
        setConversation(prev => [...prev, { type: 'ai', text: response.next_question }]);
        
        // AI speaks the next question
        setIsAISpeaking(true);
        try {
          await speechService.speak(response.next_question);
        } catch (error) {
          console.error('Error speaking next question:', error);
        } finally {
          setIsAISpeaking(false);
        }
      }
      
    } catch (error) {
      console.error('Error processing answer:', error);
    } finally {
      setIsProcessing(false);
      setCurrentTranscript('');
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    }
    setIsMicOn(!isMicOn);
  };

  const handleEndInterview = async () => {
    try {
      speechService.stop();
      if (audioRecordingService.isRecording()) {
        await audioRecordingService.stopRecording();
      }
      
      await interviewService.endInterview(sessionId);
      onInterviewEnd();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error ending interview:', error);
      onInterviewEnd();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-orange-200 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 font-mono font-semibold">
                {formatTime(interviewTime)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              AI Interview Session
            </div>
          </div>
          
          <Button
            onClick={handleEndInterview}
            variant="destructive"
            className="bg-red-500 hover:bg-red-600"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex p-6 gap-6 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        {/* Left Panel - Video Feeds */}
        <div className="w-1/2 space-y-6">
          {/* Candidate Video */}
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">You</h3>
              <div className="aspect-video">
                <VideoFeed 
                  muted={!isMicOn}
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Interviewer */}
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">AI Interviewer</h3>
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-3 ${isAISpeaking ? 'animate-pulse' : ''}`}>
                    <span className="text-white font-bold text-2xl">AI</span>
                  </div>
                  <div className="text-orange-600 font-medium">
                    {isAISpeaking ? 'Speaking...' : 'Listening'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Conversation and Controls */}
        <div className="w-1/2 flex flex-col">
          {/* Current Question */}
          <Card className="border-orange-200 mb-4">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Current Question</h3>
              <p className="text-gray-700 bg-orange-50 p-3 rounded-lg">
                {currentQuestion}
              </p>
            </CardContent>
          </Card>

          {/* Conversation History */}
          <Card className="border-orange-200 flex-1 mb-4">
            <CardContent className="p-4 h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Conversation</h3>
              <div 
                ref={conversationRef}
                className="flex-1 overflow-y-auto space-y-3 bg-gray-50 p-3 rounded-lg"
              >
                {conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.type === 'ai'
                        ? 'bg-orange-100 text-gray-800 mr-8'
                        : 'bg-white text-gray-800 ml-8 shadow-sm'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1 text-gray-600">
                      {message.type === 'ai' ? 'AI Interviewer' : 'You'}
                    </div>
                    <div>{message.text}</div>
                  </div>
                ))}
                
                {currentTranscript && (
                  <div className="p-3 rounded-lg bg-blue-50 ml-8 border border-blue-200">
                    <div className="text-xs font-medium mb-1 text-blue-600">
                      You (Processing...)
                    </div>
                    <div className="text-gray-800">{currentTranscript}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={toggleVideo}
                  variant={isVideoOn ? "default" : "destructive"}
                  size="lg"
                  className={isVideoOn ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={isMicOn ? (isListening ? stopListening : startListening) : toggleMic}
                  variant={isMicOn ? "default" : "destructive"}
                  size="lg"
                  disabled={isAISpeaking || isProcessing}
                  className={
                    !isMicOn 
                      ? "" 
                      : isListening 
                        ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                        : "bg-orange-500 hover:bg-orange-600"
                  }
                >
                  {isMicOn ? (
                    isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </Button>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                {isAISpeaking && "AI is speaking..."}
                {isListening && "Listening to your response..."}
                {isProcessing && "Processing your answer..."}
                {!isAISpeaking && !isListening && !isProcessing && "Click the microphone to respond"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
