'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/data/listings';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    location?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  logout: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      // 1. Purge any legacy demo user stored in client localStorage
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('bazaar_current_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (
              !parsed ||
              parsed.email?.includes('example.com') ||
              parsed.name?.toLowerCase().includes('arjun') ||
              parsed.name?.toLowerCase().includes('sharma') ||
              parsed.name?.toLowerCase().includes('demo') ||
              parsed.id === '11111111-1111-1111-1111-111111111111'
            ) {
              localStorage.removeItem('bazaar_current_user');
            }
          }
        } catch {
          // Ignore
        }
      }

      // 2. Real Supabase Session & Profile initialization
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // Load real profile from Supabase profiles table
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
            } else {
              // Construct profile from authenticated user metadata
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                phone: session.user.user_metadata?.phone || null,
                location: session.user.user_metadata?.location || null,
                avatar_url: session.user.user_metadata?.avatar_url || null,
                role: session.user.user_metadata?.role || 'user',
              });
            }
          } else {
            // User is logged out
            setUser(null);
          }

          // Subscribe to Supabase auth state changes
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
              if (newSession?.user) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', newSession.user.id)
                  .single();

                setUser(profile || {
                  id: newSession.user.id,
                  name: newSession.user.user_metadata?.name || newSession.user.email?.split('@')[0] || 'User',
                  email: newSession.user.email || '',
                  phone: newSession.user.user_metadata?.phone || null,
                  location: newSession.user.user_metadata?.location || null,
                  avatar_url: newSession.user.user_metadata?.avatar_url || null,
                  role: newSession.user.user_metadata?.role || 'user',
                });
              } else {
                setUser(null);
              }
            }
          );

          setLoading(false);
          return () => {
            authListener.subscription.unsubscribe();
          };
        } catch (err) {
          console.error('Supabase auth initialization error:', err);
          setUser(null);
          setLoading(false);
          return;
        }
      }

      // 3. Fallback when Supabase credentials are not yet configured:
      // Check if user previously logged in locally; otherwise default to LOGGED OUT (null).
      try {
        const stored = localStorage.getItem('bazaar_current_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }

      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Email address is required.' };
    }
    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    const cleanEmail = email.trim();

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) return { success: false, error: error.message };
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setUser(profile);
          } else {
            setUser({
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email || cleanEmail,
              phone: data.user.user_metadata?.phone || null,
              location: data.user.user_metadata?.location || null,
              avatar_url: data.user.user_metadata?.avatar_url || null,
              role: data.user.user_metadata?.role || 'user',
            });
          }
          return { success: true };
        }
      } catch (e: any) {
        return { success: false, error: e.message || 'Login failed.' };
      }
    }

    // Local authentication fallback
    try {
      const usersStr = localStorage.getItem('bazaar_registered_accounts');
      const registeredUsers = usersStr ? JSON.parse(usersStr) : [];
      const found = registeredUsers.find(
        (u: any) => u.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (found) {
        if (found.password && found.password !== password) {
          return { success: false, error: 'Incorrect password.' };
        }
        const profile: Profile = {
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone || null,
          location: found.location || null,
          avatar_url: found.avatar_url || null,
          role: found.role || 'user',
        };
        setUser(profile);
        localStorage.setItem('bazaar_current_user', JSON.stringify(profile));
        return { success: true };
      }

      return {
        success: false,
        error: 'No account found with this email. Please sign up to create your account.',
      };
    } catch {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signUp = async (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    location?: string;
  }) => {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!data.email || !data.email.trim()) {
      return { success: false, error: 'Email address is required.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim();
    const cleanPhone = data.phone?.trim() || null;
    const cleanLocation = data.location?.trim() || null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: authData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              name: cleanName,
              phone: cleanPhone,
              location: cleanLocation,
            },
          },
        });

        if (error) return { success: false, error: error.message };

        if (authData.user) {
          const newProfile: Profile = {
            id: authData.user.id,
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            location: cleanLocation,
            avatar_url: null,
            role: 'user',
          };
          setUser(newProfile);
          return { success: true };
        }
      } catch (e: any) {
        return { success: false, error: e.message || 'Registration failed.' };
      }
    }

    // Local authentication registration
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      location: cleanLocation,
      avatar_url: null,
      role: 'user',
    };

    try {
      const usersStr = localStorage.getItem('bazaar_registered_accounts');
      const registeredUsers = usersStr ? JSON.parse(usersStr) : [];
      registeredUsers.push({ ...newProfile, password: data.password });
      localStorage.setItem('bazaar_registered_accounts', JSON.stringify(registeredUsers));
      localStorage.setItem('bazaar_current_user', JSON.stringify(newProfile));
    } catch {}

    setUser(newProfile);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    try {
      localStorage.removeItem('bazaar_current_user');
    } catch {}
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('profiles').update(data).eq('id', user.id);
      } catch {}
    }
    setUser(updated);
    try {
      localStorage.setItem('bazaar_current_user', JSON.stringify(updated));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
