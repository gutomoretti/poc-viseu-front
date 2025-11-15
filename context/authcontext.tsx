'use client';

import React, { createContext, useCallback, useMemo, useState, useEffect } from 'react';
import { AuthCredentials, AuthUser } from '@/types/auth';
import { AuthService } from '@/services/auth-service';
import { authStorage } from '@/lib/auth-storage';

interface AuthContextValue {
    isAuthenticated: boolean;
    token: string | null;
    user: AuthUser | null;
    initializing: boolean;
    login: (credentials: AuthCredentials) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const storedToken = authStorage.getToken();
        const storedUser = authStorage.getUser();
        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUser) {
            setUser(storedUser);
        }
        setInitializing(false);
    }, []);

    const login = useCallback(async (credentials: AuthCredentials) => {
        const result = await AuthService.login(credentials);
        if (!result.success || !result.token || !result.user) {
            return { success: false, message: result.message ?? 'Falha ao autenticar' };
        }
        setToken(result.token);
        setUser(result.user);
        authStorage.setToken(result.token);
        authStorage.setUser(result.user);
        return { success: true };
    }, []);

    const logout = useCallback(async () => {
        await AuthService.logout();
        authStorage.clearAll();
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            isAuthenticated: !!token,
            token,
            user,
            initializing,
            login,
            logout
        }),
        [token, user, initializing, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
