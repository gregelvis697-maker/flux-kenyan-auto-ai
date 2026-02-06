import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address').max(255);

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6">
      <Link
        to="/auth"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 -m-2 rounded-lg active:bg-accent/50"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Login</span>
      </Link>

      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-card">
        <CardHeader className="space-y-1 pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription className="text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-sm text-foreground font-medium">
                Password reset link sent to your email. Please check your inbox (and spam folder).
              </p>
              <Link to="/auth" className="text-sm text-primary hover:underline mt-2">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={emailRef}
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 sm:h-10 text-base sm:text-sm bg-gradient-primary hover:shadow-glow-primary transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
              <div className="mt-4 sm:mt-6 text-center">
                <Link
                  to="/auth"
                  className="text-sm text-primary hover:underline py-2 px-4 -m-2 rounded-lg"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
