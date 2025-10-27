import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${roleInfo.color}`} />
            <span className="text-xl font-bold">Flux</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
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
