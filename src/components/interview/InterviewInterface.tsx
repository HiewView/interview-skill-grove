
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Code, Clock, SkipForward } from 'lucide-react';
import { clientSpeechRecognition } from '../../utils/clientSpeechUtils';

interface InterviewInterfaceProps {
  sessionId: string;
  onQuestionReceived?: (question: string) => void;
  onAnswerSubmitted?: (answer: string) => void;
  onInterviewEnd?: () => void;
}

const InterviewInterface: React.FC<InterviewInterfaceProps> = ({
  sessionId,
  onQuestionReceived,
  onAnswerSubmitted,
  onInterviewEnd
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState("Welcome! Please introduce yourself and tell me about your background.");
  const [transcript, setTranscript] = useState("");
  const [interviewTime, setInterviewTime] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<Array<{type: 'ai' | 'user', message: string}>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setInterviewTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStartListening = async () => {
    try {
      setIsListening(true);
      await clientSpeechRecognition({
        onResult: (result) => {
          setTranscript(result.transcript);
          if (result.isFinal) {
            setConversationHistory(prev => [...prev, {type: 'user', message: result.transcript}]);
            if (onAnswerSubmitted) {
              onAnswerSubmitted(result.transcript);
            }
            setTranscript("");
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      });
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    // Note: clientSpeechRecognition doesn't export a stop function
  };

  const handleNextQuestion = () => {
    // TODO: Implement next question logic
    const nextQuestion = "Can you tell me about a challenging project you've worked on?";
    setCurrentQuestion(nextQuestion);
    setConversationHistory(prev => [...prev, {type: 'ai', message: nextQuestion}]);
    if (onQuestionReceived) {
      onQuestionReceived(nextQuestion);
    }
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
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-mono text-lg">{formatTime(interviewTime)}</span>
            </div>
            <div className="text-white/60">
              Session ID: {sessionId}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-lg transition-colors ${
                isMuted ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white hover:bg-blue-600/80'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-lg transition-colors ${
                !isVideoOn ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white hover:bg-blue-600/80'
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={handleNextQuestion}
              className="p-3 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600/80 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            
            <button className="p-3 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600/80 transition-colors">
              <Code className="w-5 h-5" />
            </button>
            
            <button 
              onClick={onInterviewEnd}
              className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600/80 transition-colors"
            >
              End Interview
            </button>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex flex-1 p-6 gap-6 h-[calc(100vh-88px)]">
        {/* Left Panel - Candidate Video */}
        <div className="w-1/2">
          <div className="h-full bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
            {isVideoOn ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">YOU</span>
                </div>
                <div className="text-gray-300">Your Video Feed</div>
                <div className="text-gray-400 text-sm mt-2">Camera is active</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-700/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoOff className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-gray-300">Video Off</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Interviewer & Conversation */}
        <div className="w-1/2 flex flex-col">
          {/* AI Interviewer */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500/80 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <div>
                <div className="text-blue-400 font-bold text-lg">AI Interviewer</div>
                <div className="text-white/60 text-sm">Powered by Advanced AI</div>
              </div>
            </div>
          </div>
          
          {/* Conversation Display */}
          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-blue-400 text-sm font-medium mb-2">AI Interviewer:</div>
                <div className="text-white text-lg">{currentQuestion}</div>
              </div>
              
              {conversationHistory.map((item, index) => (
                <div 
                  key={index}
                  className={`rounded-lg p-4 ${
                    item.type === 'ai' 
                      ? 'bg-blue-500/10 border border-blue-500/30' 
                      : 'bg-white/10 border border-white/20'
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    item.type === 'ai' ? 'text-blue-400' : 'text-white/60'
                  }`}>
                    {item.type === 'ai' ? 'AI Interviewer:' : 'You:'}
                  </div>
                  <div className="text-white">{item.message}</div>
                </div>
              ))}
              
              {transcript && (
                <div className="bg-white/10 border border-white/20 rounded-lg p-4 opacity-70">
                  <div className="text-white/60 text-sm font-medium mb-2">You (speaking...):</div>
                  <div className="text-white">{transcript}</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Speaking Controls */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              disabled={isMuted}
              className={`px-8 py-4 rounded-lg font-medium transition-colors text-lg ${
                isListening 
                  ? 'bg-red-500/80 text-white hover:bg-red-600/80' 
                  : isMuted
                  ? 'bg-gray-600/80 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500/80 text-white hover:bg-blue-600/80'
              }`}
            >
              {isListening ? 'Stop Speaking' : isMuted ? 'Unmute to Speak' : 'Start Speaking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewInterface;
