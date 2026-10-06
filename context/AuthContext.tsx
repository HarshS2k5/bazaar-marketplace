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
    bio?: string;
  }) => Promise<{ success: boolean; error?: string; requiresConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  logout: async () => {},
  updateProfile: async () => ({ success: false }),
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      // 1. Purge legacy demo users if stored in client localStorage
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
              .maybeSingle();

            if (profile) {
              if (profile.is_suspended) {
                await supabase.auth.signOut();
                setUser(null);
              } else {
                setUser(profile);
              }
            } else {
              // Construct and save profile from authenticated user metadata
              const newProfile: Profile = {
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Customer',
                email: session.user.email || '',
                phone: session.user.user_metadata?.phone || null,
                location: session.user.user_metadata?.location || null,
                bio: session.user.user_metadata?.bio || null,
                avatar_url: session.user.user_metadata?.avatar_url || null,
                role: session.user.user_metadata?.role || 'user',
                is_suspended: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              try {
                await supabase.from('profiles').insert(newProfile);
              } catch {}
              setUser(newProfile);
            }
          } else {
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
                  .maybeSingle();

                if (profile) {
                  if (profile.is_suspended) {
                    await supabase.auth.signOut();
                    setUser(null);
                  } else {
                    setUser(profile);
                  }
                } else {
                  setUser({
                    id: newSession.user.id,
                    name: newSession.user.user_metadata?.name || newSession.user.email?.split('@')[0] || 'Customer',
                    email: newSession.user.email || '',
                    phone: newSession.user.user_metadata?.phone || null,
                    location: newSession.user.user_metadata?.location || null,
                    bio: newSession.user.user_metadata?.bio || null,
                    avatar_url: newSession.user.user_metadata?.avatar_url || null,
                    role: newSession.user.user_metadata?.role || 'user',
                    is_suspended: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });
                }
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

      // 3. Fallback when Supabase credentials are not configured (local dev)
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

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
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

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            return {
              success: false,
              error: 'Please verify your email address before signing in. Check your inbox for the confirmation email.',
            };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile) {
            if (profile.is_suspended) {
              await supabase.auth.signOut();
              return {
                success: false,
                error: 'This account has been suspended due to marketplace policy violations. Please contact support.',
              };
            }
            setUser(profile);
          } else {
            const newProfile: Profile = {
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Customer',
              email: data.user.email || cleanEmail,
              phone: data.user.user_metadata?.phone || null,
              location: data.user.user_metadata?.location || null,
              bio: data.user.user_metadata?.bio || null,
              avatar_url: data.user.user_metadata?.avatar_url || null,
              role: data.user.user_metadata?.role || 'user',
              is_suspended: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            try {
              await supabase.from('profiles').insert(newProfile);
            } catch {}
            setUser(newProfile);
          }
          return { success: true };
        }
      } catch (e: any) {
        return { success: false, error: e.message || 'Login failed.' };
      }
    }

    // Local authentication fallback (dev)
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
        if (found.is_suspended) {
          return { success: false, error: 'This account has been suspended.' };
        }
        const profile: Profile = {
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone || null,
          location: found.location || null,
          bio: found.bio || null,
          avatar_url: found.avatar_url || null,
          role: found.role || 'user',
          is_suspended: found.is_suspended || false,
          created_at: found.created_at,
          updated_at: found.updated_at,
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
    bio?: string;
  }): Promise<{ success: boolean; error?: string; requiresConfirmation?: boolean }> => {
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
    const cleanBio = data.bio?.trim() || null;

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
              bio: cleanBio,
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
            bio: cleanBio,
            avatar_url: null,
            role: 'user',
            is_suspended: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Save customer profile record to database
          try {
            await supabase.from('profiles').upsert(newProfile);
          } catch (err) {
            console.warn('Direct profile upsert error:', err);
          }

          if (authData.session) {
            setUser(newProfile);
            return { success: true };
          } else {
            return { success: true, requiresConfirmation: true };
          }
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
      bio: cleanBio,
      avatar_url: null,
      role: 'user',
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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

  const updateProfile = async (data: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated.' };
    const updated: Profile = { ...user, ...data, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('profiles').update(data).eq('id', user.id);
        if (error) throw error;

        // Sync seller phone & location to all active listings created by this customer
        if (data.phone !== undefined || data.location !== undefined) {
          const syncData: any = {};
          if (data.phone !== undefined) syncData.phone = data.phone;
          if (data.location !== undefined) syncData.location = data.location;
          try {
            await supabase.from('listings').update(syncData).eq('seller_id', user.id);
          } catch {}
        }
      } catch (err: any) {
        console.error('Update profile error:', err);
        return { success: false, error: err.message || 'Failed to update profile.' };
      }
    }

    setUser(updated);
    try {
      localStorage.setItem('bazaar_current_user', JSON.stringify(updated));
    } catch {}

    return { success: true };
  };

  const refreshProfile = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile) setUser(profile);
        }
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signUp,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
