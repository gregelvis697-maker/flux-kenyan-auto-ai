import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Home, ArrowLeft, LogOut } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

const Unauthorized = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getProperDashboard = () => {
    if (!userRole) return '/';
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'buyer':
        return '/dashboard/buyer';
      case 'dealer':
        return '/dashboard/dealer';
      case 'importer':
        return '/dashboard/importer';
      default:
        return '/';
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4 sm:p-6 pt-20 sm:pt-24">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-card">
          <CardHeader className="text-center space-y-3 sm:space-y-4 pb-4">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
              <ShieldX className="w-7 h-7 sm:w-8 sm:h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Access Denied</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6">
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground border border-border/50">
              <p>
                This area is restricted to users with specific roles. If you believe you should have access, 
                please contact an administrator.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <Button 
                    onClick={() => navigate(getProperDashboard())} 
                    className="w-full h-11 sm:h-10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to My Dashboard
                  </Button>
                  <Button 
                    onClick={handleSignOut} 
                    variant="outline" 
                    className="w-full h-11 sm:h-10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="w-full h-11 sm:h-10">
                    <Link to="/auth">
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full h-11 sm:h-10">
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Unauthorized;
