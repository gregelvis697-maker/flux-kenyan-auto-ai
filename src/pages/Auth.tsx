import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Lock, UserCircle } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

type UserRole = 'buyer' | 'dealer' | 'importer';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user, userRole, approvalStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && approvalStatus === 'pending') {
      navigate('/pending-approval', { replace: true });
    } else if (user && userRole && approvalStatus === 'approved') {
      navigate(`/dashboard/${userRole}`, { replace: true });
    }
  }, [user, userRole, approvalStatus, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        const validatedData = authSchema.parse({ email, password });
        const { error } = await signUp(validatedData.email, validatedData.password, role);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          const successMessage = role === 'buyer' 
            ? 'Account created successfully! Redirecting to your dashboard...'
            : 'Account created! Your request is pending admin approval. You will be notified via email.';
          
          toast({
            title: 'Success',
            description: successMessage,
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
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
        to="/" 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 -m-2 rounded-lg active:bg-accent/50"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>
      
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-card">
        <CardHeader className="space-y-1 pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-sm">
            {isLogin
              ? 'Enter your credentials to access your dashboard'
              : 'Choose your role and create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={isLogin ? undefined : 12}
                  className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground px-1">
                  Min 12 characters with uppercase, lowercase, number & special character
                </p>
              )}
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm">Role</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger id="role" className="pl-10 h-11 sm:h-10 text-base sm:text-sm bg-background">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="buyer" className="text-base sm:text-sm py-2.5 sm:py-2">Buyer</SelectItem>
                      <SelectItem value="dealer" className="text-base sm:text-sm py-2.5 sm:py-2">Dealer</SelectItem>
                      <SelectItem value="importer" className="text-base sm:text-sm py-2.5 sm:py-2">Importer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-11 sm:h-10 text-base sm:text-sm bg-gradient-primary hover:shadow-glow-primary transition-all" 
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-4 sm:mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline py-2 px-4 -m-2 rounded-lg active:bg-accent/30 transition-colors"
              disabled={isLoading}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;