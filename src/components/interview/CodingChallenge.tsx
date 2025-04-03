
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Clock, 
  Play,
  RotateCcw,
  Save,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface CodingChallengeProps {
  onClose: () => void;
  problem: {
    title: string;
    description: string;
    example: string;
    constraints: string[];
  } | null;
}

const CodingChallenge: React.FC<CodingChallengeProps> = ({ onClose, problem }) => {
  const [timeLeft] = useState("15:00");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  
  if (!problem) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl flex flex-col h-[90vh]">
        {/* Header */}
        <header className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="font-semibold">Coding Challenge: {problem.title || "Problem Solving"}</h1>
              <div className="flex items-center text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>{timeLeft}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="destructive" size="sm" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden p-6 grid grid-cols-2 gap-6">
          {/* Left Panel - Problem Statement */}
          <Card className="p-6 overflow-auto">
            <div className="prose">
              <h2 className="text-xl font-semibold mb-4">{problem.title || "Coding Problem"}</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-gray-600">
                    {problem.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Example</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-mono text-sm whitespace-pre-wrap">
                      {problem.example}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Constraints</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Right Panel - Code Editor */}
          <Card className="flex flex-col overflow-hidden">
            <div className="border-b p-4 flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-sm border rounded p-1"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="cpp">C++</option>
                </select>
                <Button>Submit Solution</Button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full min-h-[400px] font-mono text-sm p-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder={`// Write your ${language} solution here...`}
                spellCheck="false"
              />
            </div>

            {/* Test Cases */}
            <div className="border-t p-4">
              <h3 className="font-semibold mb-4">Test Cases</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">Test Case 1: Passed</span>
                  </div>
                  <span className="text-sm text-gray-500">2ms</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm">Test Case 2: Failed</span>
                  </div>
                  <span className="text-sm text-gray-500">1ms</span>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CodingChallenge;
