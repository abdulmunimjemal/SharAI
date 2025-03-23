import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HealthStatus } from '@shared/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ['#00ACC1', '#8D6E63', '#FFB300', '#26A69A', '#9575CD'];

// Sample data for charts
const dailyQuestions = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  questions: Math.floor(Math.random() * 50) + 10,
}));

const apiUsage = Array.from({ length: 12 }, (_, i) => ({
  name: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
  openai: Math.floor(Math.random() * 1000) + 500,
  pinecone: Math.floor(Math.random() * 500) + 200,
}));

const languageDistribution = [
  { name: 'English', value: 65 },
  { name: 'Arabic', value: 20 },
  { name: 'Urdu', value: 10 },
  { name: 'French', value: 3 },
  { name: 'Other', value: 2 },
];

const StatsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  const { data: healthStatus, isLoading: healthLoading } = useQuery<HealthStatus>({
    queryKey: ['/api/admin/health'],
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-orange-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'healthy': return 'ri-heart-fill';
      case 'degraded': return 'ri-heart-pulse-fill';
      case 'down': return 'ri-heart-3-line';
      default: return 'ri-question-fill';
    }
  };

  return (
    <div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">API Usage</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Daily Questions</CardTitle>
                <CardDescription>Questions asked per day over the past month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyQuestions}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ACC1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#00ACC1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area type="monotone" dataKey="questions" stroke="#00ACC1" fillOpacity={1} fill="url(#colorQuestions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Language Distribution</CardTitle>
                <CardDescription>Questions by language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {languageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-4">
          <div className="flex justify-end mb-2">
            <div className="inline-flex space-x-1 rounded-md bg-muted p-1">
              <button 
                className={`px-2.5 py-1 text-xs font-medium rounded-sm ${timeRange === 'day' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setTimeRange('day')}
              >
                Day
              </button>
              <button 
                className={`px-2.5 py-1 text-xs font-medium rounded-sm ${timeRange === 'week' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={`px-2.5 py-1 text-xs font-medium rounded-sm ${timeRange === 'month' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button 
                className={`px-2.5 py-1 text-xs font-medium rounded-sm ${timeRange === 'year' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">API Requests</CardTitle>
              <CardDescription>Requests made to different APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={apiUsage}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="openai" name="OpenAI API" fill="#00ACC1" />
                    <Bar dataKey="pinecone" name="Pinecone API" fill="#8D6E63" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Language Distribution</CardTitle>
              <CardDescription>Questions asked in different languages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={140}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {languageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">System Health</CardTitle>
              <CardDescription>Current status of all services</CardDescription>
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : healthStatus ? (
                <div>
                  <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-md">
                    <div className="flex items-center">
                      <i className={`${getStatusIcon(healthStatus.status)} ${getStatusColor(healthStatus.status)} text-xl mr-2`}></i>
                      <div>
                        <h3 className={`font-medium ${getStatusColor(healthStatus.status)}`}>
                          System Status: {healthStatus.status.charAt(0).toUpperCase() + healthStatus.status.slice(1)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Uptime: {Math.floor(healthStatus.uptime / 3600)} hours, {Math.floor((healthStatus.uptime % 3600) / 60)} minutes
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      Last checked: {new Date(healthStatus.lastCheck).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Services</h3>
                    {Object.entries(healthStatus.services).map(([service, status]) => (
                      <div key={service} className="flex items-center justify-between p-3 border border-gray-100 rounded-md">
                        <div className="flex items-center">
                          <i className={`${getStatusIcon(status.status)} ${getStatusColor(status.status)} text-lg mr-2`}></i>
                          <div>
                            <p className="font-medium">{service.charAt(0).toUpperCase() + service.slice(1)}</p>
                            <p className="text-xs text-gray-500">
                              Latency: {status.latency}ms
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-md font-medium ${
                          status.status === 'healthy' ? 'bg-green-100 text-green-700' :
                          status.status === 'degraded' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-gray-500">Failed to load health status</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsTab;
