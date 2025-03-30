
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PlusCircle, 
  Calendar, 
  MoreVertical, 
  User, 
  Trash2,
  BarChart
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { interviewService } from '@/services/interviewService';
import { Badge } from '@/components/ui/badge';

interface Template {
  id: string;
  name: string;
  role: string;
}

interface Candidate {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'invited' | 'completed';
  interview_date?: string;
  template_id: string;
}

const CandidateManager: React.FC = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [candidateInput, setCandidateInput] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [addMethod, setAddMethod] = useState<'bulk' | 'individual'>('individual');
  
  useEffect(() => {
    // Load templates and candidates
    const loadedTemplates = interviewService.getTemplates();
    const loadedCandidates = interviewService.getCandidates();
    setTemplates(loadedTemplates);
    setCandidates(loadedCandidates);
  }, []);
  
  const handleAddCandidates = () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select an interview template",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let emailsToAdd: string[] = [];
      
      if (addMethod === 'bulk') {
        // Split by commas or newlines
        emailsToAdd = candidateInput
          .split(/[\n,]/)
          .map(email => email.trim())
          .filter(email => email.includes('@'));
      } else {
        // Single email
        if (candidateInput.includes('@')) {
          emailsToAdd = [candidateInput.trim()];
        }
      }
      
      if (emailsToAdd.length === 0) {
        toast({
          title: "No Valid Emails",
          description: "Please enter valid email addresses",
          variant: "destructive"
        });
        return;
      }
      
      // Add candidates
      const newCandidates = interviewService.addCandidates(emailsToAdd, selectedTemplate);
      setCandidates(prev => [...prev, ...newCandidates]);
      
      toast({
        title: "Candidates Added",
        description: `Successfully added ${newCandidates.length} candidate(s)`,
      });
      
      // Reset and close dialog
      setCandidateInput('');
      setSelectedTemplate('');
      setAddMethod('individual');
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding candidates:", error);
      toast({
        title: "Error",
        description: "Failed to add candidates. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleScheduleInterviews = () => {
    if (!selectedDate || selectedCandidates.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select both a date and at least one candidate",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Format date to ISO string
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      // Schedule interviews
      interviewService.scheduleCandidateInterviews(selectedCandidates, dateStr);
      
      // Update local state
      const updatedCandidates = candidates.map(candidate => {
        if (selectedCandidates.includes(candidate.id)) {
          return {
            ...candidate,
            status: 'invited',
            interview_date: dateStr
          };
        }
        return candidate;
      });
      
      setCandidates(updatedCandidates);
      
      toast({
        title: "Interviews Scheduled",
        description: `Successfully scheduled ${selectedCandidates.length} interview(s)`,
      });
      
      // Reset and close dialog
      setSelectedCandidates([]);
      setSelectedDate(undefined);
      setShowScheduleDialog(false);
    } catch (error) {
      console.error("Error scheduling interviews:", error);
      toast({
        title: "Error",
        description: "Failed to schedule interviews. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteCandidate = (candidateId: string) => {
    // Filter out the candidate
    const updatedCandidates = candidates.filter(c => c.id !== candidateId);
    setCandidates(updatedCandidates);
    
    // Update local storage
    localStorage.setItem('interview_candidates', JSON.stringify(updatedCandidates));
    
    toast({
      title: "Candidate Removed",
      description: "The candidate has been removed",
    });
  };
  
  const toggleCandidateSelection = (candidateId: string) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    } else {
      setSelectedCandidates(prev => [...prev, candidateId]);
    }
  };
  
  const getTemplateNameById = (templateId: string): string => {
    const template = templates.find(t => t.id === templateId);
    return template?.name || "Unknown Template";
  };
  
  // Group candidates by template for analysis
  const templateCandidateCounts = templates.reduce((acc, template) => {
    const candidatesForTemplate = candidates.filter(c => c.template_id === template.id);
    const completedCount = candidatesForTemplate.filter(c => c.status === 'completed').length;
    
    if (candidatesForTemplate.length > 0) {
      acc.push({
        templateId: template.id,
        templateName: template.name,
        role: template.role,
        totalCandidates: candidatesForTemplate.length,
        completedInterviews: completedCount,
        hasCompletedInterviews: completedCount > 0
      });
    }
    return acc;
  }, [] as Array<{
    templateId: string;
    templateName: string;
    role: string;
    totalCandidates: number;
    completedInterviews: number;
    hasCompletedInterviews: boolean;
  }>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Candidate Management</h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowScheduleDialog(true)}
            disabled={candidates.filter(c => c.status === 'pending').length === 0}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Interviews
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Candidates
          </Button>
        </div>
      </div>
      
      {/* Candidate Analysis Cards */}
      {templateCandidateCounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {templateCandidateCounts.map((stats) => (
            <Card key={stats.templateId}>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-2">{stats.templateName}</h3>
                <p className="text-sm text-muted-foreground mb-4">{stats.role}</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Total Candidates</span>
                      <span className="font-medium">{stats.totalCandidates}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Completed Interviews</span>
                      <span className="font-medium">
                        {stats.completedInterviews} / {stats.totalCandidates}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${(stats.completedInterviews / stats.totalCandidates) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Link to={`/compare/${stats.templateId}`}>
                      <Button 
                        className="w-full" 
                        disabled={!stats.hasCompletedInterviews}
                      >
                        <BarChart className="mr-2 h-4 w-4" />
                        {stats.hasCompletedInterviews 
                          ? "Compare Candidates" 
                          : "No Completed Interviews"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Candidate List */}
      {candidates.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map(candidate => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="font-medium">{candidate.email}</div>
                    {candidate.name && (
                      <div className="text-sm text-muted-foreground">{candidate.name}</div>
                    )}
                  </TableCell>
                  <TableCell>{getTemplateNameById(candidate.template_id)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        candidate.status === 'completed' ? 'default' : 
                        candidate.status === 'invited' ? 'outline' : 'secondary'
                      }
                    >
                      {candidate.status === 'completed' ? 'Completed' : 
                       candidate.status === 'invited' ? 'Scheduled' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {candidate.interview_date ? format(new Date(candidate.interview_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {candidate.status === 'completed' && (
                          <DropdownMenuItem 
                            onSelect={() => {
                              window.open(`/report/${candidate.id}`, '_blank');
                            }}
                          >
                            View Report
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onSelect={() => {
                            const url = `/interview?template_id=${candidate.template_id}&candidate_id=${candidate.id}`;
                            window.open(url, '_blank');
                          }}
                        >
                          Start Interview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDeleteCandidate(candidate.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Candidates Yet</h3>
            <p className="text-sm text-foreground/70 text-center max-w-md mb-4">
              Add candidates to interview using your templates. You can add them individually or in bulk.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Candidates
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Add Candidates Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Candidates</DialogTitle>
            <DialogDescription>
              Add candidates for interview and assign them to a template
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Add Method</Label>
              <RadioGroup value={addMethod} onValueChange={(value) => setAddMethod(value as 'bulk' | 'individual')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual">Individual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bulk" id="bulk" />
                  <Label htmlFor="bulk">Bulk Add</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>
                {addMethod === 'bulk' 
                  ? 'Candidate Emails (one per line or comma-separated)' 
                  : 'Candidate Email'}
              </Label>
              {addMethod === 'bulk' ? (
                <Textarea 
                  value={candidateInput}
                  onChange={(e) => setCandidateInput(e.target.value)}
                  placeholder="candidate1@example.com,
candidate2@example.com"
                  rows={4}
                />
              ) : (
                <Input
                  type="email"
                  value={candidateInput}
                  onChange={(e) => setCandidateInput(e.target.value)}
                  placeholder="candidate@example.com"
                />
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCandidates}>
              Add Candidates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interviews</DialogTitle>
            <DialogDescription>
              Select a date and candidates to schedule interviews
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Interview Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Select Candidates</Label>
              <div className="border rounded-md max-h-64 overflow-y-auto p-1">
                {candidates
                  .filter(candidate => candidate.status === 'pending')
                  .map(candidate => (
                    <div 
                      key={candidate.id} 
                      className={`flex items-center p-2 rounded-md ${
                        selectedCandidates.includes(candidate.id) 
                          ? 'bg-primary/10' 
                          : 'hover:bg-muted cursor-pointer'
                      }`}
                      onClick={() => toggleCandidateSelection(candidate.id)}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => toggleCandidateSelection(candidate.id)}
                      />
                      <div className="overflow-hidden">
                        <div className="text-sm font-medium truncate">{candidate.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {getTemplateNameById(candidate.template_id)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedCandidates.length} candidate(s) selected
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleInterviews}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateManager;
