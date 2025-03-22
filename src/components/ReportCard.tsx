
import React from 'react';

interface ReportMetric {
  name: string;
  value: number;
  color: string;
}

interface ReportCardProps {
  title: string;
  metrics: ReportMetric[];
}

const ReportCard: React.FC<ReportCardProps> = ({ title, metrics }) => {
  return (
    <div className="glass-card">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{metric.name}</span>
              <span className="font-medium">{metric.value}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${metric.value}%`,
                  backgroundColor: metric.color 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportCard;
