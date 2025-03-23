import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import PatternBackground from '@/components/ui/pattern-background';

const Admin: React.FC = () => {
  const { isAuthenticated, isLoading, login, logout } = useAdmin();
  
  const handleLogin = async (credentials: { username: string; password: string }) => {
    await login(credentials.username, credentials.password);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PatternBackground />
      
      <div id="adminInterface" className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isAuthenticated ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <AdminLogin onLogin={handleLogin} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default Admin;
