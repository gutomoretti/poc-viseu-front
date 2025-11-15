const DEFAULT_API_BASE_URL = 'https://localhost:7227/';

const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

export const environment = {
    apiBaseUrl: ensureTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL)
};

export type Environment = typeof environment;
