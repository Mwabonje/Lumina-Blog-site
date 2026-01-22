import { User } from '../types';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lumina.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

const ADMIN_USER: User = {
  id: 'admin-1',
  email: ADMIN_EMAIL,
  name: 'Admin User',
  role: 'admin',
};

// Simple mock auth using localStorage to persist session
export const login = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem('lumina_user', JSON.stringify(ADMIN_USER));
    return ADMIN_USER;
  }
  throw new Error('Invalid credentials');
};

export const logout = () => {
  localStorage.removeItem('lumina_user');
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('lumina_user');
  return stored ? JSON.parse(stored) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('lumina_user');
};