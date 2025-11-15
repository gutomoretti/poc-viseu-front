import { environment } from '@/config/environment';

export const API_BASE_URL = environment.apiBaseUrl;

export interface ApiClientOptions extends RequestInit {
    path: string;
}

export interface ApiResult<T> {
    data: T | null;
    error: string | null;
}

export async function apiRequest<T>(options: ApiClientOptions): Promise<ApiResult<T>> {
    const { path, ...init } = options;
    const url = new URL(path, API_BASE_URL);

    try {
        const response = await fetch(url, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...(init.headers || {})
            }
        });

        if (!response.ok) {
            return {
                data: null,
                error: `Request failed with status ${response.status}`
            };
        }

        const payload = (await response.json()) as T;
        return { data: payload, error: null };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
