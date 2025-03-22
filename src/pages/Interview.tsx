
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InterviewInterface from '../components/InterviewInterface';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl } from '../components/ui/form';
import { useForm } from 'react-hook-form';
import { interviewService, generateSessionId } from '../services/interviewService';
import { toast } from "@/hooks/use-toast";

const Interview: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [templateInfo, setTemplateInfo] = useState<any>(null);
  const location = useLocation();
  
  // Extract template ID and candidate info from URL params if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const templateId = searchParams.get('template_id');
    const candidateId = searchParams.get('candidate_id');
    
    if (templateId) {
      const template = interviewService.getTemplateById(templateId);
      if (template) {
        setTemplateInfo(template);
      }
    }
    
    // Generate a unique session ID
    setSessionId(generateSessionId());
  }, [location]);
  
  // Try to load previous form data from localStorage
  const savedFormData = localStorage.getItem('interview_form_data');
  const parsedFormData = savedFormData ? JSON.parse(savedFormData) : null;
  
  const form = useForm({
    defaultValues: {
      name: parsedFormData?.name || '',
      role: templateInfo?.role || parsedFormData?.role || '',
      experience: parsedFormData?.experience || '',
      resumeText: parsedFormData?.resumeText || ''
    }
  });

  // Update form when template info changes
  useEffect(() => {
    if (templateInfo) {
      form.setValue('role', templateInfo.role);
    }
  }, [templateInfo, form]);

  const onSubmit = async (data: any) => {
    try {
      // Save form data to localStorage
      localStorage.setItem('interview_form_data', JSON.stringify(data));
      
      // Start the interview session
      await interviewService.startInterview({
        session_id: sessionId,
        name: data.name,
        role: data.role,
        experience: data.experience,
        resume_text: data.resumeText,
        template_id: templateInfo?.id,
      });
      
      setIsStarted(true);
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the interview service",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="page-transition pt-20 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {!isStarted ? (
          <div className="glass border border-border rounded-xl overflow-hidden mt-4 mb-8 p-6">
            <h1 className="text-2xl font-bold mb-2">Start Your Interview</h1>
            
            {templateInfo && (
              <div className="mb-6 p-4 bg-primary/5 rounded-lg">
                <p className="font-medium text-primary">
                  Interview Template: {templateInfo.name}
                </p>
                <p className="text-sm mt-1">Role: {templateInfo.role}</p>
                {templateInfo.description && (
                  <p className="text-sm mt-2">{templateInfo.description}</p>
                )}
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position Applying For</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Software Engineer" 
                            {...field} 
                            disabled={!!templateInfo}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="3" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="resumeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paste your resume text (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste the text content of your resume here..." 
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
                    Start Interview
                  </button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <div className="glass border border-border rounded-xl overflow-hidden mt-4 mb-8">
            <InterviewInterface sessionId={sessionId} templateInfo={templateInfo} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
