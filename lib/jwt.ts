const decodeBase64 = (payload: string) => {
    if (typeof window === 'undefined') {
        return Buffer.from(payload, 'base64').toString('utf-8');
    }

    // atob requires padding adjustments
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return atob(padded);
};

export const decodeJwt = <T = Record<string, any>>(token: string): T | null => {
    try {
        const [, payload] = token.split('.');
        if (!payload) {
            return null;
        }
        const decoded = decodeBase64(payload);
        return JSON.parse(decoded) as T;
    } catch (error) {
        console.warn('Failed to decode JWT payload', error);
        return null;
    }
};
