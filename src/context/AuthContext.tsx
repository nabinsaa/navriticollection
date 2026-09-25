import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', session.user.id)
          .single();
        
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.email?.split('@')[0] || 'User',
          role: profile?.role || 'user',
        });
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', session.user.id)
            .single();
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || session.user.email?.split('@')[0] || 'User',
            role: profile?.role || 'user',
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', data.user.id)
      .single();
    
    setUser({
      id: data.user.id,
      email: data.user.email || '',
      name: profile?.name || data.user.email?.split('@')[0] || 'User',
      role: profile?.role || 'user',
    });
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error || !data.user) return false;

    await supabase.from('profiles').insert([{
      id: data.user.id,
      email,
      name,
      role: 'user',
    }]);

    setUser({
      id: data.user.id,
      email,
      name,
      role: 'user',
    });
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
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
