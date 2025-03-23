import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiKeysTab from './ApiKeysTab';
import DocumentsTab from './DocumentsTab';
import FeedbackTab from './FeedbackTab';
import StatsTab from './StatsTab';
import { useQuery } from '@tanstack/react-query';
import { Stats } from '@shared/types';
import StatsCard from './ui/stats-card';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('apiKeys');

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/admin/stats'],
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <button 
          className="text-sm text-gray-600 hover:text-primary flex items-center transition-colors"
          onClick={onLogout}
        >
          <i className="ri-logout-box-line mr-1"></i> Logout
        </button>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Questions"
          value={statsLoading ? '...' : stats?.totalQuestions || 0}
          icon={<i className="ri-question-line text-xl text-primary"></i>}
          iconBgColor="bg-primary/10"
          footer={
            <p className="text-xs text-green-600 mt-4 flex items-center">
              <i className="ri-arrow-up-line mr-1"></i> 12% increase this week
            </p>
          }
        />
        
        <StatsCard
          title="API Requests"
          value={statsLoading ? '...' : stats?.apiRequests || 0}
          icon={<i className="ri-server-line text-xl text-secondary"></i>}
          iconBgColor="bg-secondary/10"
          footer={
            <p className="text-xs text-gray-500 mt-4 flex items-center">
              <i className="ri-time-line mr-1"></i> Last 30 days
            </p>
          }
        />
        
        <StatsCard
          title="Documents"
          value={statsLoading ? '...' : stats?.documentsCount || 0}
          icon={<i className="ri-file-text-line text-xl text-accent"></i>}
          iconBgColor="bg-accent/10"
          footer={
            <p className="text-xs text-green-600 mt-4 flex items-center">
              <i className="ri-add-line mr-1"></i> 18 new this month
            </p>
          }
        />
        
        <StatsCard
          title="System Health"
          value={statsLoading ? '...' : stats?.systemHealth || '99.8%'}
          icon={<i className="ri-heart-pulse-line text-xl text-green-600"></i>}
          iconBgColor="bg-green-100"
          footer={
            <p className="text-xs text-gray-500 mt-4 flex items-center">
              <i className="ri-time-line mr-1"></i> Last update: 5 min ago
            </p>
          }
        />
      </div>
      
      {/* Admin Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 mb-8">
        <Tabs defaultValue="apiKeys" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-100">
            <TabsList className="h-auto bg-transparent border-b">
              <TabsTrigger 
                value="apiKeys" 
                className="py-4 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                <i className="ri-key-line mr-1"></i> API Keys
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="py-4 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                <i className="ri-file-list-line mr-1"></i> Documents
              </TabsTrigger>
              <TabsTrigger 
                value="feedback" 
                className="py-4 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                <i className="ri-feedback-line mr-1"></i> Feedback
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="py-4 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
              >
                <i className="ri-bar-chart-line mr-1"></i> Statistics
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <TabsContent value="apiKeys" className="mt-0">
              <ApiKeysTab />
            </TabsContent>
            
            <TabsContent value="documents" className="mt-0">
              <DocumentsTab />
            </TabsContent>
            
            <TabsContent value="feedback" className="mt-0">
              <FeedbackTab />
            </TabsContent>
            
            <TabsContent value="stats" className="mt-0">
              <StatsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
