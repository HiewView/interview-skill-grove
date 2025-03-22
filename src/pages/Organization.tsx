
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import RoleTemplates from '../components/organization/RoleTemplates';
import CandidateManager from '../components/organization/CandidateManager';

const Organization: React.FC = () => {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="page-transition pt-20 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Organization Dashboard</h1>
            <Link 
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Switch to Candidate View
            </Link>
          </div>
          <p className="text-foreground/70 mt-2">
            Manage interview templates and candidates
          </p>
        </div>

        <Tabs 
          defaultValue="templates" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="templates">Role Templates</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <RoleTemplates />
          </TabsContent>
          
          <TabsContent value="candidates">
            <CandidateManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Organization;
