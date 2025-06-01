
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Code, Clock } from 'lucide-react';
import { clientSpeechRecognition } from '../../utils/clientSpeechUtils';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-mono">{formatTime(interviewTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white hover:bg-blue-600/80'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2 rounded-lg transition-colors ${
                !isVideoOn ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white hover:bg-blue-600/80'
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            
            <button className="p-2 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600/80 transition-colors">
              <Code className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex flex-1 p-4 gap-4">
        {/* Left Panel - Candidate Video */}
        <div className="w-1/2">
          <div className="bg-white/5 backdrop-blur-md rounded-xl aspect-video flex items-center justify-center border border-white/10">
            {isVideoOn ? (
              <div className="text-gray-300">Your Video Feed</div>
            ) : (
              <div className="text-gray-300">Video Off</div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Interviewer */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-white/5 backdrop-blur-md rounded-xl aspect-video flex items-center justify-center border border-white/10 mb-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <div className="text-blue-400 font-medium">AI Interviewer</div>
            </div>
          </div>
          
          {/* Conversation */}
          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-400 text-sm font-medium mb-1">AI Interviewer:</div>
                <div className="text-white">{currentQuestion}</div>
              </div>
              
              {transcript && (
                <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                  <div className="text-white/60 text-sm font-medium mb-1">You:</div>
                  <div className="text-white">{transcript}</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isListening 
                  ? 'bg-red-500/80 text-white hover:bg-red-600/80' 
                  : 'bg-blue-500/80 text-white hover:bg-blue-600/80'
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
