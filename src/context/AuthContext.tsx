import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthResult {
  success: boolean;
  message?: string;
  requiresConfirmation?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadProfile(authUser: { id: string; email?: string; user_metadata?: { name?: string } }) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    console.error('Error loading profile:', error);
  }

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    role: profile?.role === 'admin' ? 'admin' as const : 'user' as const,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Error checking auth session:', error);
      if (!mounted) return;

      if (session?.user) {
        const appUser = await loadProfile(session.user);
        if (mounted) setUser(appUser);
      } else {
        setUser(null);
      }
    };

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const appUser = await loadProfile(session.user);
        if (mounted) setUser(appUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (error || !data.user || !data.session) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error?.message || 'Unable to sign in.',
      };
    }

    const appUser = await loadProfile(data.user);
    setUser(appUser);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error || !data.user) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error?.message || 'Failed to create account.',
      };
    }

    // If email confirmation is enabled, Supabase intentionally returns no session.
    // Do not mark the user as authenticated until the email has been confirmed.
    if (!data.session) {
      return {
        success: true,
        requiresConfirmation: true,
        message: 'Account created. Please check your email and confirm your address before signing in.',
      };
    }

    // Some Supabase projects allow immediate sessions. Keep the profile in sync when possible.
    const { error: profileError } = await supabase.from('profiles').upsert([{
      id: data.user.id,
      email: normalizedEmail,
      name: name.trim(),
      role: 'user',
    }], { onConflict: 'id' });

    if (profileError) console.error('Profile creation error:', profileError);

    const appUser = await loadProfile(data.user);
    setUser(appUser);
    return { success: true };
  };

  const resendConfirmation = async (email: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (error) {
      console.error('Resend confirmation error:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Confirmation email sent. Please check your inbox.' };
  };

  const sendPasswordReset = async (email: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Password reset request error:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'If an account exists for this email, a password reset link has been sent.' };
  };

  const updatePassword = async (password: string): Promise<AuthResult> => {
    const { data: { user: authUser }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !authUser) {
      return { success: false, message: 'Your password reset link is invalid or has expired. Please request a new one.' };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error('Password update error:', error);
      return { success: false, message: error.message };
    }

    const appUser = await loadProfile(authUser);
    setUser(appUser);
    return { success: true, message: 'Your password has been updated.' };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      resendConfirmation,
      sendPasswordReset,
      updatePassword,
      logout,
      isAdmin: user?.role === 'admin',
      isAuthenticated: user !== null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
