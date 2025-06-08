
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Code, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clientSpeechRecognition } from '../utils/clientSpeechUtils';

interface InterviewInterfaceProps {
  sessionId: string;
  onQuestionReceived?: (question: string) => void;
  onAnswerSubmitted?: (answer: string) => void;
}

const InterviewInterface: React.FC<InterviewInterfaceProps> = ({
  sessionId,
  onQuestionReceived,
  onAnswerSubmitted
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState("Welcome! Please introduce yourself.");
  const [transcript, setTranscript] = useState("");
  const [interviewTime, setInterviewTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setInterviewTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStartListening = async () => {
    try {
      setIsListening(true);
      clientSpeechRecognition.create(
        (result) => {
          setTranscript(result.transcript);
          if (result.isFinal && onAnswerSubmitted) {
            onAnswerSubmitted(result.transcript);
          }
        },
        () => {
          console.log('Silence detected');
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      );
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-orange-100 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Interview</span>
            </Link>
            <div className="flex items-center space-x-2 ml-8">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 font-mono font-semibold">{formatTime(interviewTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2 rounded-lg transition-colors ${
                !isVideoOn ? 'bg-red-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            
            <button className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <Code className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex flex-1 p-6 gap-6 max-w-7xl mx-auto">
        {/* Left Panel - Candidate Video */}
        <div className="w-1/2">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl aspect-video flex items-center justify-center border border-orange-200 shadow-lg">
            {isVideoOn ? (
              <div className="text-gray-500 text-lg">Your Video Feed</div>
            ) : (
              <div className="text-gray-500 text-lg">Video Off</div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Interviewer */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl aspect-video flex items-center justify-center border border-orange-200 shadow-lg mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-2xl">AI</span>
              </div>
              <div className="text-orange-600 font-medium text-lg">AI Interviewer</div>
            </div>
          </div>
          
          {/* Conversation */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-200 shadow-lg">
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-orange-600 text-sm font-medium mb-2">AI Interviewer:</div>
                <div className="text-gray-900">{currentQuestion}</div>
              </div>
              
              {transcript && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-gray-600 text-sm font-medium mb-2">You:</div>
                  <div className="text-gray-900">{transcript}</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`px-8 py-4 rounded-lg font-medium transition-all ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600'
              }`}
            >
              {isListening ? 'Stop Speaking' : 'Start Speaking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewInterface;
