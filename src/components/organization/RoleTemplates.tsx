
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Code, 
  Users, 
  Copy
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { interviewService } from '@/services/interviewService';

const RoleTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [formState, setFormState] = useState({
    name: '',
    role: '',
    description: '',
    rules: '',
    jobDescription: '',
    questions: ['', '', '']
  });

  // Load templates on component mount
  useEffect(() => {
    const loadedTemplates = interviewService.getTemplates();
    setTemplates(loadedTemplates);
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!showAddModal && !showEditModal) {
      setFormState({
        name: '',
        role: '',
        description: '',
        rules: '',
        jobDescription: '',
        questions: ['', '', '']
      });
    }
  }, [showAddModal, showEditModal]);

  // When editing, populate form with template data
  useEffect(() => {
    if (currentTemplate && showEditModal) {
      setFormState({
        name: currentTemplate.name || '',
        role: currentTemplate.role || '',
        description: currentTemplate.description || '',
        rules: currentTemplate.rules || '',
        jobDescription: currentTemplate.job_description || '',
        questions: currentTemplate.questions || ['', '', '']
      });
    }
  }, [currentTemplate, showEditModal]);

  const handleInputChange = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...formState.questions];
    newQuestions[index] = value;
    setFormState(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const addQuestion = () => {
    setFormState(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };

  const removeQuestion = (index: number) => {
    if (formState.questions.length > 1) {
      const newQuestions = formState.questions.filter((_, i) => i !== index);
      setFormState(prev => ({
        ...prev,
        questions: newQuestions
      }));
    }
  };

  const handleSubmit = () => {
    // Validate form
    if (!formState.name || !formState.role) {
      toast({
        title: 'Validation Error',
        description: 'Template name and role are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Filter out empty questions
      const filteredQuestions = formState.questions.filter(q => q.trim() !== '');
      
      if (filteredQuestions.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one interview question is required',
          variant: 'destructive'
        });
        return;
      }
      
      const templateData = {
        id: currentTemplate?.id,
        name: formState.name,
        role: formState.role,
        description: formState.description,
        rules: formState.rules,
        job_description: formState.jobDescription,
        questions: filteredQuestions
      };
      
      // Save template
      const savedTemplate = interviewService.createTemplate(templateData);
      
      // Update UI
      if (showEditModal) {
        setTemplates(prevTemplates => 
          prevTemplates.map(t => t.id === savedTemplate.id ? savedTemplate : t)
        );
        toast({
          title: 'Template Updated',
          description: `"${savedTemplate.name}" has been updated successfully`
        });
      } else {
        setTemplates(prevTemplates => [...prevTemplates, savedTemplate]);
        toast({
          title: 'Template Created',
          description: `"${savedTemplate.name}" has been created successfully`
        });
      }
      
      // Close modal
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the template. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = () => {
    if (!currentTemplate) return;
    
    try {
      // Filter out the template
      const updatedTemplates = templates.filter(t => t.id !== currentTemplate.id);
      setTemplates(updatedTemplates);
      
      // Update local storage
      localStorage.setItem('interview_templates', JSON.stringify(updatedTemplates));
      
      toast({
        title: 'Template Deleted',
        description: `"${currentTemplate.name}" has been deleted`
      });
      
      // Close dialog
      setShowDeleteDialog(false);
      setCurrentTemplate(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the template',
        variant: 'destructive'
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Interview Templates</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
            <p className="text-sm text-foreground/70 text-center max-w-md mb-4">
              Create your first interview template to start conducting AI-powered interviews for your organization.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.role}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentTemplate(template);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const duplicatedTemplate = {
                            ...template,
                            id: undefined,
                            name: `Copy of ${template.name}`
                          };
                          setCurrentTemplate(duplicatedTemplate);
                          setShowEditModal(true);
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setCurrentTemplate(template);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-1 h-4 w-4" />
                  {template.questions?.length || 0} questions
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/interview?template_id=${template.id}`, '_blank')}
                >
                  Start Interview
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add/Edit Template Modal */}
      <Dialog 
        open={showAddModal || showEditModal} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setShowEditModal(false);
            setCurrentTemplate(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditModal ? 'Edit Template' : 'Create Interview Template'}</DialogTitle>
            <DialogDescription>
              {showEditModal 
                ? 'Make changes to your interview template' 
                : 'Configure a new interview template for your organization'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input 
                  id="name" 
                  value={formState.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Technical Interview"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  value={formState.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={formState.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this interview template"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea 
                id="job-description"
                value={formState.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                placeholder="Detailed job description for candidate evaluation"
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                This will be used to evaluate candidate fit after interviews
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rules">Interview Rules & Instructions</Label>
              <Textarea 
                id="rules"
                value={formState.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                placeholder="Guidelines for the AI interviewer to follow"
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Interview Questions</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addQuestion}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
              
              {formState.questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea 
                    value={question}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    placeholder={`Question ${index + 1}`}
                    className="flex-1"
                  />
                  {formState.questions.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeQuestion(index)}
                      className="flex-shrink-0 self-start"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {showEditModal ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentTemplate?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleTemplates;
