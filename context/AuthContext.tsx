import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { getCurrentUser, logout as serviceLogout } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        try {
            const u = await getCurrentUser();
            setUser(u);
        } catch (err) {
            console.error('Auth refresh failed:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const login = (user: User) => {
        setUser(user);
    };

    const logout = async () => {
        await serviceLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
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
