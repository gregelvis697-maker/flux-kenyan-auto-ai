import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

const PendingApproval = () => {
  const { userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Pending Approval</CardTitle>
            <CardDescription className="text-base">
              Your {userRole} account is awaiting admin approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p className="mb-2">
                Thank you for registering as a <span className="font-semibold text-foreground">{userRole}</span>.
              </p>
              <p>
                Our team will review your request and notify you via email once your account has been approved. 
                This typically takes 1-2 business days.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Admin reviews your account</li>
                <li>You'll receive an email notification</li>
                <li>Sign in again to access your dashboard</li>
              </ul>
            </div>

            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PendingApproval;
