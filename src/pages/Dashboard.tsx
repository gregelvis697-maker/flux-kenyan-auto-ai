import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { userRole } = useAuth();

  const getRoleInfo = () => {
    switch (userRole) {
      case 'buyer':
        return {
          title: 'Buyer Dashboard',
          description: 'Browse and purchase vehicles',
          color: 'from-blue-500 to-blue-600',
        };
      case 'dealer':
        return {
          title: 'Dealer Dashboard',
          description: 'Manage your inventory and sales',
          color: 'from-green-500 to-green-600',
        };
      case 'importer':
        return {
          title: 'Importer Dashboard',
          description: 'Manage imports and logistics',
          color: 'from-purple-500 to-purple-600',
        };
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'Platform management and oversight',
          color: 'from-red-500 to-red-600',
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome',
          color: 'from-gray-500 to-gray-600',
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className={`bg-gradient-to-br ${roleInfo.color} text-white rounded-t-lg`}>
              <CardTitle className="text-3xl">{roleInfo.title}</CardTitle>
              <CardDescription className="text-white/90">
                {roleInfo.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Welcome to your dashboard. This is a secure area based on your role permissions.
                </p>
                
                {userRole === 'admin' && (
                  <div className="mb-6">
                    <Button asChild size="lg" className="w-full sm:w-auto gap-2">
                      <Link to="/admin/dashboard">
                        <BarChart3 className="h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    </Button>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Dashboard metrics will appear here
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Your recent actions will appear here
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
