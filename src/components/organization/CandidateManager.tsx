
import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Send, Upload, User, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/hooks/use-toast";
import { interviewService } from '@/services/interviewService';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const CandidateManager: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [candidateEmails, setCandidateEmails] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Load data on component mount
  useEffect(() => {
    const loadedTemplates = interviewService.getTemplates();
    const loadedCandidates = interviewService.getCandidates();
    
    setTemplates(loadedTemplates);
    setCandidates(loadedCandidates);
    
    // If there are templates, select the first one by default
    if (loadedTemplates.length > 0) {
      setSelectedTemplateId(loadedTemplates[0].id);
    }
  }, []);

  const handleAddCandidates = () => {
    if (!selectedTemplateId) {
      toast({
        title: "Error",
        description: "Please select an interview template",
        variant: "destructive"
      });
      return;
    }

    if (!candidateEmails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive"
      });
      return;
    }

    try {
      // Parse emails (one per line or comma-separated)
      const emails = candidateEmails
        .split(/[\n,]/)
        .map(email => email.trim())
        .filter(email => email !== '');

      if (emails.length === 0) {
        toast({
          title: "Error",
          description: "No valid email addresses found",
          variant: "destructive"
        });
        return;
      }

      // Add candidates
      const newCandidates = interviewService.addCandidates(emails, selectedTemplateId);
      setCandidates(prev => [...prev, ...newCandidates]);
      
      setIsAddDialogOpen(false);
      setCandidateEmails('');

      toast({
        title: "Success",
        description: `Added ${newCandidates.length} candidates`,
      });
    } catch (error) {
      console.error("Error adding candidates:", error);
      toast({
        title: "Error",
        description: "Failed to add candidates",
        variant: "destructive"
      });
    }
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const handleScheduleInterviews = async () => {
    if (selectedCandidates.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one candidate",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select an interview date",
        variant: "destructive"
      });
      return;
    }

    try {
      // Schedule interviews
      interviewService.scheduleCandidateInterviews(
        selectedCandidates,
        format(selectedDate, 'yyyy-MM-dd')
      );

      // If webhook URL is provided, trigger it (in a real app)
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify({
              action: "schedule_interviews",
              candidates: selectedCandidates.length,
              date: format(selectedDate, 'yyyy-MM-dd')
            }),
          });
          console.log("Webhook triggered successfully");
        } catch (error) {
          console.error("Error triggering webhook:", error);
        }
      }

      // Update UI
      const updatedCandidates = interviewService.getCandidates();
      setCandidates(updatedCandidates);
      
      setIsScheduleDialogOpen(false);
      setSelectedCandidates([]);
      setSelectedDate(undefined);

      toast({
        title: "Interviews Scheduled",
        description: `Successfully scheduled ${selectedCandidates.length} interviews`,
      });
    } catch (error) {
      console.error("Error scheduling interviews:", error);
      toast({
        title: "Error",
        description: "Failed to schedule interviews",
        variant: "destructive"
      });
    }
  };

  const getTemplateNameById = (id: string) => {
    const template = templates.find(t => t.id === id);
    return template ? template.name : 'Unknown Template';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Manage Candidates</h2>
        <div className="space-x-2">
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                disabled={candidates.filter(c => c.status === "pending").length === 0}
              >
                <Send size={16} />
                Schedule Interviews
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Interviews</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Interview Date</Label>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook">Zapier Webhook URL (Optional)</Label>
                  <Input
                    id="webhook"
                    placeholder="https://hooks.zapier.com/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If provided, this webhook will be triggered when interviews are scheduled
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Select Candidates</Label>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {candidates
                      .filter(c => c.status === "pending")
                      .map(candidate => (
                        <div 
                          key={candidate.id}
                          className="flex items-center space-x-2 py-2 border-b last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            id={`candidate-${candidate.id}`}
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={() => toggleCandidateSelection(candidate.id)}
                            className="h-4 w-4"
                          />
                          <label 
                            htmlFor={`candidate-${candidate.id}`}
                            className="flex-1 text-sm"
                          >
                            {candidate.email}
                          </label>
                        </div>
                      ))}
                    
                    {candidates.filter(c => c.status === "pending").length === 0 && (
                      <p className="text-center py-2 text-muted-foreground text-sm">
                        No pending candidates available
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsScheduleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleScheduleInterviews}>
                  Schedule Interviews
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload size={16} />
                Add Candidates
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Candidates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Interview Template</Label>
                  <Select
                    value={selectedTemplateId}
                    onValueChange={setSelectedTemplateId}
                  >
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                      
                      {templates.length === 0 && (
                        <SelectItem value="none" disabled>
                          No templates available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emails">Candidate Emails</Label>
                  <Textarea
                    id="emails"
                    placeholder="Enter email addresses (one per line or comma-separated)"
                    value={candidateEmails}
                    onChange={(e) => setCandidateEmails(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddCandidates}>
                  Add Candidates
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Users size={24} className="mb-2 text-primary" />
            <p className="text-2xl font-bold">{candidates.length}</p>
            <p className="text-sm text-muted-foreground">Total Candidates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Clock size={24} className="mb-2 text-primary" />
            <p className="text-2xl font-bold">
              {candidates.filter(c => c.status === "pending").length}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CheckCircle size={24} className="mb-2 text-primary" />
            <p className="text-2xl font-bold">
              {candidates.filter(c => c.status === "invited" || c.status === "completed").length}
            </p>
            <p className="text-sm text-muted-foreground">Invited/Completed</p>
          </CardContent>
        </Card>
      </div>

      {candidates.length === 0 ? (
        <div className="glass-card text-center py-12">
          <User size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Candidates Yet</h3>
          <p className="text-muted-foreground mb-6">
            Add your first candidates to get started
          </p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 mx-auto"
            disabled={templates.length === 0}
          >
            <Upload size={16} />
            Add Candidates
          </Button>
          
          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              You need to create an interview template first
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter by status sections */}
          {["pending", "invited", "completed"].map((status) => {
            const filteredCandidates = candidates.filter(c => c.status === status);
            if (filteredCandidates.length === 0) return null;
            
            return (
              <div key={status} className="space-y-4">
                <h3 className="text-lg font-medium capitalize">
                  {status} Candidates
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {filteredCandidates.map((candidate) => (
                    <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User size={20} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{candidate.email}</p>
                              <p className="text-sm text-muted-foreground">
                                Template: {getTemplateNameById(candidate.template_id)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {candidate.interview_date && (
                              <div className="flex items-center mr-4 text-sm">
                                <Calendar size={16} className="mr-1 text-muted-foreground" />
                                <span>{candidate.interview_date}</span>
                              </div>
                            )}
                            
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              status === "invited" ? "bg-blue-100 text-blue-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {status}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateManager;
