
import React, { useState } from 'react';
import InterviewInterface from '../components/InterviewInterface';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '../components/ui/form';
import { useForm } from 'react-hook-form';

const Interview: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  
  const form = useForm({
    defaultValues: {
      name: '',
      role: '',
      experience: '',
      resumeText: ''
    }
  });

  const onSubmit = (data: any) => {
    // We'll pass this data to the interview component later
    console.log(data);
    setIsStarted(true);
  };

  return (
    <div className="page-transition pt-20 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        {!isStarted ? (
          <div className="glass border border-border rounded-xl overflow-hidden mt-4 mb-8 p-6">
            <h1 className="text-2xl font-bold mb-6">Start Your Interview</h1>
            
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
                          <Input placeholder="Software Engineer" {...field} />
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
            <InterviewInterface />
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
