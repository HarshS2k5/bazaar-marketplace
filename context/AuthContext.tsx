'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/data/listings';
import { SEED_PROFILES } from '@/lib/data/mock-data';

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
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // Load profile from public.profiles
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
            } else {
              // Fallback construct from session user
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
          }

          // Subscribe to auth state changes
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
        }
      }

      // Check localStorage for offline demo user
      try {
        const stored = localStorage.getItem('bazaar_current_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          // Default demo logged-in user so testing is instantaneous
          const defaultDemo = SEED_PROFILES[0];
          setUser(defaultDemo);
          localStorage.setItem('bazaar_current_user', JSON.stringify(defaultDemo));
        }
      } catch {}

      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    if (isSupabaseConfigured() && password) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) return { success: false, error: error.message };
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) setUser(profile);
          return { success: true };
        }
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }

    // Fallback/Local login
    const matched = SEED_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase()) || {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      phone: '+91 98201 00000',
      location: 'Mumbai, India',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      role: 'user' as const,
    };

    setUser(matched);
    try {
      localStorage.setItem('bazaar_current_user', JSON.stringify(matched));
    } catch {}
    return { success: true };
  };

  const signUp = async (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    location?: string;
  }) => {
    if (isSupabaseConfigured() && data.password) {
      try {
        const supabase = createClient();
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              phone: data.phone,
              location: data.location,
            },
          },
        });

        if (error) return { success: false, error: error.message };

        if (authData.user) {
          const newProfile: Profile = {
            id: authData.user.id,
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            location: data.location || null,
            role: 'user',
          };
          setUser(newProfile);
          return { success: true };
        }
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }

    // Fallback sign up
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      location: data.location || null,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'user',
    };
    setUser(newProfile);
    try {
      localStorage.setItem('bazaar_current_user', JSON.stringify(newProfile));
    } catch {}
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
