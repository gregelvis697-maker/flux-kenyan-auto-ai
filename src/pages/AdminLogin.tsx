import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signOut, user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Already signed in as an admin — go straight through.
  useEffect(() => {
    if (user && userRole === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Access denied', description: error.message, variant: 'destructive' });
        return;
      }

      // Confirm the account is actually an approved admin before proceeding.
      const { data: sessionData } = await supabase.auth.getUser();
      const uid = sessionData?.user?.id;
      let isAdmin = false;
      if (uid) {
        const { data } = await supabase
          .from('user_roles')
          .select('role, status')
          .eq('user_id', uid)
          .maybeSingle();
        isAdmin = data?.role === 'admin' && data?.status === 'approved';
      }

      if (!isAdmin) {
        await signOut();
        toast({
          title: 'Access denied',
          description: 'This portal is restricted to administrators.',
          variant: 'destructive',
        });
        return;
      }

      navigate('/admin/dashboard', { replace: true });
    } catch {
      toast({
        title: 'Access denied',
        description: 'Unable to sign in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background/65 p-4 sm:p-6">
      <Card className="w-full max-w-md border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 pb-4 sm:pb-6">
          <div className="inline-flex items-center gap-2 text-brand">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-editorial">Restricted</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription className="text-sm">
            Administrator credentials required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 sm:h-10 text-base sm:text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Enter Admin Portal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
