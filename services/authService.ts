import { User } from '../types';
import { insforge } from './insforgeClient';

// Helper to map InsForge user to our User type
const mapInsForgeUser = (ifUser: any): User => ({
  id: ifUser.id,
  email: ifUser.email || '',
  name: ifUser.name || ifUser.email?.split('@')[0] || 'User',
  role: (ifUser.role as 'admin' | 'editor') || 'editor',
});

export const login = async (email: string, password: string): Promise<User> => {
  console.log("Attempting login for:", email);
  try {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("InsForge Login Error:", error);
      throw new Error(error.message || 'Invalid credentials');
    }

    if (!data?.user) {
      console.warn("No user data returned from InsForge");
      throw new Error('Login failed: No user data returned');
    }

    console.log("Login successful:", data.user.id);
    return mapInsForgeUser(data.user);
  } catch (err: any) {
    console.error("Login exception:", err);
    throw err;
  }
};

export const logout = async () => {
  await insforge.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await insforge.auth.getCurrentUser();
  return data?.user ? mapInsForgeUser(data.user) : null;
};

export const verifyOtp = async (email: string, token: string): Promise<void> => {
  console.log("Verifying OTP for:", email);
  const { error } = await insforge.auth.verifyEmail({
    email,
    otp: token
  });

  if (error) {
    console.error("Verification Error:", error);
    throw new Error(error.message || 'Verification failed');
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await insforge.auth.getCurrentUser();
  return !!data?.user;
};