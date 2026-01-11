import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserRole = 'buyer' | 'dealer' | 'importer' | 'admin' | null;
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  approvalStatus: ApprovalStatus;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role as UserRole);
      setApprovalStatus(data?.status as ApprovalStatus);
      return data?.role as UserRole;
    } catch (error) {
      setUserRole(null);
      setApprovalStatus(null);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      if (role === 'admin') {
        return { error: new Error('Admin accounts can only be created manually') };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role,
            full_name: ''
          }
        }
      });

      if (error) throw error;

      if (data.user && role) {
        // Profile will be auto-created by database trigger
        
        // Auto-approve buyers, pending for dealers and importers
        const status = role === 'buyer' ? 'approved' : 'pending';
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: data.user.id, 
            role,
            status,
            ...(status === 'approved' && { approved_at: new Date().toISOString() })
          });

        if (roleError) throw roleError;
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify user has a valid role assigned
      if (data.user) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, status')
          .eq('user_id', data.user.id)
          .maybeSingle();

        // If no role exists, account is not properly configured
        // Admins must be created manually via backend dashboard
        if (!roleData && !roleError) {
          await supabase.auth.signOut();
          throw new Error('Account not properly configured. Please contact an administrator.');
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUserRole(null);
      setApprovalStatus(null);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, approvalStatus, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
