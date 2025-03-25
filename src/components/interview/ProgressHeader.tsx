
import React from 'react';

interface ProgressHeaderProps {
  timer: number;
  progress: number;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ timer, progress }) => {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
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
  );
};

export default ProgressHeader;
