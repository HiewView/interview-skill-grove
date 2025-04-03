
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Clock, 
  Play,
  RotateCcw,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CodingChallengeProps {
  onClose: () => void;
  problem?: {
    title: string;
    description: string;
    example: string;
    constraints: string[];
  };
}

const CodingChallenge: React.FC<CodingChallengeProps> = ({ 
  onClose,
  problem = {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
    example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9",
    constraints: [
      "2 ≤ nums.length ≤ 104",
      "-109 ≤ nums[i] ≤ 109",
      "-109 ≤ target ≤ 109"
    ]
  }
}) => {
  const [timeLeft] = useState("45:00");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="font-semibold">Coding Challenge: {problem.title}</h1>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span>{timeLeft}</span>
            </div>
          </div>
          <Button variant="destructive" onClick={onClose}>Exit Challenge</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem Statement */}
          <Card className="p-6">
            <div className="prose">
              <h2 className="text-xl font-semibold mb-4">Problem: {problem.title}</h2>
              
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
                    <p className="font-mono text-sm whitespace-pre-line">
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
          <Card className="flex flex-col">
            <div className="border-b p-4 flex items-center justify-between flex-wrap gap-2">
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
                  className="text-sm border rounded-md p-1.5"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                <Button>Submit Solution</Button>
              </div>
            </div>

            <div className="flex-1 p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full min-h-[400px] font-mono text-sm p-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={`Write your ${language} solution here...`}
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
        </div>
      </main>
    </div>
  );
};

export default CodingChallenge;
