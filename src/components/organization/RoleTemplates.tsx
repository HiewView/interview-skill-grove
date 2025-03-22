
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, File } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/hooks/use-toast";
import { interviewService } from '@/services/interviewService';

const RoleTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>({
    name: '',
    role: '',
    description: '',
    rules: '',
    questions: ['', '', ''] // Default 3 questions
  });

  // Load templates on component mount
  useEffect(() => {
    const loadedTemplates = interviewService.getTemplates();
    setTemplates(loadedTemplates);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...currentTemplate.questions];
    updatedQuestions[index] = value;
    setCurrentTemplate(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    setCurrentTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };

  const removeQuestion = (index: number) => {
    if (currentTemplate.questions.length <= 1) return;
    const updatedQuestions = currentTemplate.questions.filter((_, i) => i !== index);
    setCurrentTemplate(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleSubmit = () => {
    try {
      // Basic validation
      if (!currentTemplate.name || !currentTemplate.role) {
        toast({
          title: "Validation Error",
          description: "Template name and role are required",
          variant: "destructive"
        });
        return;
      }

      // Filter out empty questions
      const filteredQuestions = currentTemplate.questions.filter(q => q.trim() !== '');
      if (filteredQuestions.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one question is required",
          variant: "destructive"
        });
        return;
      }

      // Save template with filtered questions
      const templateToSave = {
        ...currentTemplate,
        questions: filteredQuestions
      };

      const savedTemplate = interviewService.createTemplate(templateToSave);
      
      // Update the templates list
      setTemplates(prev => {
        const existingIndex = prev.findIndex(t => t.id === savedTemplate.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = savedTemplate;
          return updated;
        }
        return [...prev, savedTemplate];
      });

      setIsDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Interview template has been saved",
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save the template",
        variant: "destructive"
      });
    }
  };

  const editTemplate = (template: any) => {
    setCurrentTemplate(template);
    setIsDialogOpen(true);
  };

  const deleteTemplate = (id: string) => {
    // In a real app, this would call an API to delete the template
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template Deleted",
      description: "The template has been removed",
    });
  };

  const resetForm = () => {
    setCurrentTemplate({
      name: '',
      role: '',
      description: '',
      rules: '',
      questions: ['', '', '']
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Interview Templates</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentTemplate.id ? 'Edit Interview Template' : 'Create Interview Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentTemplate.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Frontend Developer Interview"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={currentTemplate.role}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Role Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentTemplate.description}
                  onChange={handleInputChange}
                  placeholder="Describe the role requirements and responsibilities"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rules">Interview Rules & Guidelines</Label>
                <Textarea
                  id="rules"
                  name="rules"
                  value={currentTemplate.rules}
                  onChange={handleInputChange}
                  placeholder="Special instructions or focus areas for the AI interviewer"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <Label>Seed Questions (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    className="h-8"
                  >
                    <Plus size={14} className="mr-1" /> Add Question
                  </Button>
                </div>
                
                {currentTemplate.questions.map((question: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={question}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder={`Question ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      disabled={currentTemplate.questions.length <= 1}
                      className="h-10 px-2"
                    >
                      <Trash size={16} className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit}>
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="glass-card text-center py-12">
          <File size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first interview template to get started
          </p>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus size={16} />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span>{template.name}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => editTemplate(template)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash size={16} className="text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Role:</span>
                    <span className="text-sm ml-2">{template.role}</span>
                  </div>
                  
                  {template.description && (
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description.length > 100
                          ? `${template.description.substring(0, 100)}...`
                          : template.description}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm font-medium">Questions:</span>
                    <p className="text-sm text-muted-foreground">
                      {template.questions.length} questions defined
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleTemplates;
