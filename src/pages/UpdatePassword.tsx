import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .max(128)
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => navigate('/auth', { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      passwordSchema.parse(password);

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        if (updateError.message.toLowerCase().includes('expired') || updateError.message.toLowerCase().includes('invalid')) {
          setError('This reset link has expired or is invalid. Please request a new one.');
        } else {
          setError(updateError.message);
        }
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('An unexpected error occurred. Please try again.');
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
          <CardTitle className="text-xl sm:text-2xl font-bold">Create New Password</CardTitle>
          <CardDescription className="text-sm">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-sm text-foreground font-medium">
                Password updated successfully! Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                  {error.includes('expired') && (
                    <Link to="/reset-password" className="ml-auto shrink-0 text-primary hover:underline text-xs">
                      Request new link
                    </Link>
                  )}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={passwordRef}
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground px-1">
                    Min 12 characters with uppercase, lowercase, number & special character
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 sm:h-10 text-base sm:text-sm bg-gradient-primary hover:shadow-glow-primary transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
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

export default UpdatePassword;
