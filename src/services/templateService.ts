
/**
 * Service for managing interview templates
 */

import { OrganizationTemplate } from '../types/interview';

/**
 * Get all templates from local storage
 */
const getTemplates = (): OrganizationTemplate[] => {
  const templates = localStorage.getItem('interview_templates');
  return templates ? JSON.parse(templates) : [];
};

/**
 * Save a template to local storage
 */
const saveTemplate = (template: OrganizationTemplate): void => {
  const templates = getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem('interview_templates', JSON.stringify(templates));
};

/**
 * Template service with public methods
 */
export const templateService = {
  /**
   * Get all interview templates
   */
  getTemplates(): OrganizationTemplate[] {
    return getTemplates();
  },

  /**
   * Get a specific template by ID
   */
  getTemplateById(id: string): OrganizationTemplate | undefined {
    return getTemplates().find(t => t.id === id);
  },

  /**
   * Create or update an interview template
   */
  createTemplate(template: Partial<OrganizationTemplate> & { 
    name: string; 
    role: string; 
    description: string; 
    rules: string; 
    questions: string[];
    job_description?: string;
  }): OrganizationTemplate {
    const newTemplate: OrganizationTemplate = {
      ...template,
      id: template.id || generateId(),
    };
    
    saveTemplate(newTemplate);
    return newTemplate;
  }
};

/**
 * Generate a unique ID
 * @private
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
