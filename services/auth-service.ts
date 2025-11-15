import { decodeJwt } from '@/lib/jwt';
import { AuthCredentials, AuthUser } from '@/types/auth';
import { API_BASE_URL } from '@/lib/api-client';

interface LoginResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: AuthUser;
}

const buildBackendUrl = (path: string) => {
    return new URL(path, API_BASE_URL).toString();
};

const buildUserFromToken = (token: string | undefined, fallback: Partial<AuthUser>) => {
    if (!token) {
        return fallback;
    }

    const payload = decodeJwt<AuthUser>(token) ?? {};
    return {
        username: payload?.username || payload?.unique_name || payload?.sub || fallback.username || 'Usuário',
        role: payload?.role || payload?.perfil || payload?.Profile || 'Usuário',
        ...payload
    };
};

export const AuthService = {
    login: async (credentials: AuthCredentials): Promise<LoginResponse> => {
        try {
            const response = await fetch(buildBackendUrl('api/Auth/authenticate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const payload = await response.json();
            if (!response.ok) {
                return {
                    success: false,
                    message: payload?.message || 'Credenciais inválidas'
                };
            }

            const token: string | undefined = payload?.jwtToken ?? payload?.token ?? payload?.accessToken ?? payload?.value;

            const inlineUser =
                payload?.user ??
                (payload?.name || payload?.role || payload?.fullname
                    ? {
                          username: payload?.username ?? payload?.name ?? credentials.username,
                          role: payload?.role ?? 'Usuário',
                          fullname: payload?.fullname,
                          refreshToken: payload?.refreshToken,
                          id: payload?.id
                      }
                    : null);

            const user: AuthUser = inlineUser ?? buildUserFromToken(token, { username: credentials.username });

            if (token) {
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token })
                });
            }

            return {
                success: true,
                token,
                user
            } as LoginResponse;
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Erro inesperado'
            };
        }
    },
    logout: async () => {
        try {
            await fetch('/api/auth/session', {
                method: 'DELETE'
            });
        } catch (error) {
            console.warn('Failed to clear auth session', error);
        }
    }
};
