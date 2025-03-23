import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

interface AdminLoginProps {
  onLogin: (credentials: AdminLoginValues) => Promise<void>;
  isLoading: boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, isLoading }) => {
  const { toast } = useToast();
  
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleSubmit = async (values: AdminLoginValues) => {
    try {
      await onLogin(values);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'Invalid username or password',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-card rounded-lg shadow-md p-8 border border-border animate-fade-in">
      <div className="text-center mb-6">
        <i className="ri-shield-keyhole-line text-4xl text-primary"></i>
        <h2 className="text-2xl font-bold text-foreground mt-2">Admin Login</h2>
        <p className="text-muted-foreground text-sm mt-1">Access the administration dashboard</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your username" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter your password" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="islamic-loader" style={{ width: '20px', height: '20px' }}></span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminLogin;
