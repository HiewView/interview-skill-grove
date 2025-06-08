
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Upload, FileText, User, Briefcase, Clock } from 'lucide-react';

interface PreInterviewSetupProps {
  onStartInterview: (data: {
    name: string;
    role: string;
    experience: string;
    resumeText?: string;
    resumeFile?: File;
  }) => void;
  isLoading: boolean;
}

const PreInterviewSetup: React.FC<PreInterviewSetupProps> = ({ onStartInterview, isLoading }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      
      // If it's a text file, read its content
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setResumeText(e.target?.result as string || '');
        };
        reader.readAsText(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && role && experience) {
      onStartInterview({
        name,
        role,
        experience,
        resumeText: resumeText || undefined,
        resumeFile: resumeFile || undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Interview Setup
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Please provide your details before starting the AI interview
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2 text-orange-500" />
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 mr-2 text-orange-500" />
                  Role/Position
                </label>
                <Input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Frontend Developer, Data Scientist"
                  required
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 mr-2 text-orange-500" />
                  Years of Experience
                </label>
                <Input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g., 3 years, Fresher, 5+ years"
                  required
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 mr-2 text-orange-500" />
                  Resume (Optional)
                </label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      className="border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Resume
                    </Button>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {resumeFile && (
                      <span className="text-sm text-gray-600">
                        {resumeFile.name}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Or paste your resume text:
                    </label>
                    <Textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      rows={4}
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!name || !role || !experience || isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3"
            >
              {isLoading ? 'Starting Interview...' : 'Start Interview'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreInterviewSetup;
