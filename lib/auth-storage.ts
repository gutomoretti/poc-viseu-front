import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from './constants';
import { AuthUser } from '@/types/auth';

const isBrowser = () => typeof window !== 'undefined';

export const authStorage = {
    getToken: () => {
        if (!isBrowser()) return null;
        return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    },
    setToken: (token: string) => {
        if (!isBrowser()) return;
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    },
    removeToken: () => {
        if (!isBrowser()) return;
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    },
    setUser: (user: AuthUser) => {
        if (!isBrowser()) return;
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    },
    getUser: () => {
        if (!isBrowser()) return null;
        const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY);
        if (!stored) return null;

        try {
            return JSON.parse(stored) as AuthUser;
        } catch (error) {
            console.warn('Failed to parse stored user', error);
            return null;
        }
    },
    clearUser: () => {
        if (!isBrowser()) return;
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    },
    clearAll: () => {
        if (!isBrowser()) return;
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
};
