import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, Mail, CheckCircle, ArrowRight } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 pt-20 sm:pt-24">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-card">
          <CardHeader className="text-center space-y-3 sm:space-y-4 pb-4">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
              <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Pending Approval</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Your <span className="font-medium text-foreground">{userRole}</span> account is awaiting admin approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6">
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground border border-border/50">
              <p className="mb-2">
                Thank you for registering as a <span className="font-semibold text-foreground">{userRole}</span>.
              </p>
              <p>
                Our team will review your request and notify you via email once your account has been approved. 
                This typically takes 1-2 business days.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm sm:text-base">What happens next?</h4>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-primary" />
                  </div>
                  <span>Admin reviews your account</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                    <Mail className="w-3 h-3 text-primary" />
                  </div>
                  <span>You'll receive an email notification</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                  <span>Sign in again to access your dashboard</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="w-full h-11 sm:h-10 text-sm"
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