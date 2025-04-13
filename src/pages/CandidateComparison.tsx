
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Trophy, Check, X, Star, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { comparisonService } from '@/services/comparisonService';
import ReportCard from '@/components/ReportCard';

interface ComparisonData {
  template: {
    id: string;
    name: string;
    role: string;
    job_description: string;
  };
  comparison: {
    ranked_candidates: Array<{
      report_id: string;
      rank: number;
      strengths: string[];
      weaknesses: string[];
      recommendation: string;
      overall_score: number;
    }>;
    overall_recommendation: string;
  };
  candidates: Array<{
    report_id: string;
    session_id: string;
    overall_score: number;
    technical_score: number;
    communication_score: number;
    personality_score: number;
  }>;
  candidate_count: number;
}

const CandidateComparison: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchComparison = async () => {
      if (!templateId) {
        setError('No template ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const data = await comparisonService.compareCandidates(templateId);
        setComparisonData(data);
        
      } catch (error) {
        console.error('Failed to fetch candidate comparison:', error);
        setError('Failed to load candidate comparison data');
        toast({
          title: "Error",
          description: "Failed to fetch candidate comparison data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComparison();
  }, [templateId]);
  
  if (isLoading) {
    return (
      <div className="page-transition pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center mb-8 gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/organization">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Skeleton className="h-8 w-72" />
          </div>
          
          <Skeleton className="w-full h-32 mb-8 rounded-lg" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="w-full h-80 rounded-lg" />
            <Skeleton className="w-full h-80 rounded-lg" />
            <Skeleton className="w-full h-80 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !comparisonData) {
    return (
      <div className="page-transition pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="glass-card text-center p-12">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-medium mb-4">Data Not Available</h2>
            <p className="mb-6">{error || "Failed to load candidate comparison data"}</p>
            <Link to="/organization" className="btn-primary">
              Back to Organization
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Handling case with no candidates
  if (comparisonData.candidate_count === 0) {
    return (
      <div className="page-transition pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center mb-8 gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/organization">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">
              {comparisonData.template.name}
            </h1>
          </div>
          
          <div className="glass-card text-center p-12">
            <h2 className="text-2xl font-medium mb-4">No Completed Interviews</h2>
            <p className="mb-6">There are no completed interviews for this template yet.</p>
            <Link to="/organization" className="btn-primary">
              Back to Organization
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition pt-24 pb-16">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/organization">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {comparisonData.template.name}
              </h1>
              <p className="text-muted-foreground">
                Role: {comparisonData.template.role} • {comparisonData.candidate_count} candidates
              </p>
            </div>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              The role candidates were interviewed for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">
              {comparisonData.template.job_description || "No job description provided for this role."}
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              Overall Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {comparisonData.comparison.overall_recommendation || 
                "Based on the interviews conducted, compare the candidates and choose the best fit for this role."}
            </p>
          </CardContent>
        </Card>
        
        <h2 className="text-2xl font-bold mb-6">Candidate Rankings</h2>
        
        <div className="space-y-6">
          {comparisonData.comparison.ranked_candidates.map((candidate) => (
            <Card key={candidate.report_id} className="relative overflow-hidden">
              {candidate.rank === 1 && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-amber-500 text-white">
                    Top Candidate
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Rank #{candidate.rank}
                      <Badge variant={candidate.rank <= 2 ? "default" : "outline"}>
                        {candidate.overall_score}% Score
                      </Badge>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Tabs defaultValue="strengths">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="strengths">Strengths</TabsTrigger>
                    <TabsTrigger value="weaknesses">Areas for Improvement</TabsTrigger>
                    <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="strengths" className="mt-4 space-y-2">
                    {candidate.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p>{strength}</p>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="weaknesses" className="mt-4 space-y-2">
                    {candidate.weaknesses.map((weakness, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <p>{weakness}</p>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="recommendation" className="mt-4">
                    <div className="flex items-start gap-2">
                      <Star className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p>{candidate.recommendation}</p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="pt-4 border-t flex justify-end">
                  <Link to={`/report/${candidate.report_id}`}>
                    <Button>View Full Report</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateComparison;
