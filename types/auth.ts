export interface AuthCredentials {
    username: string;
    password: string;
    conId?: number;
}

export interface AuthUser {
    username: string;
    role?: string;
    exp?: number;
    [key: string]: any;
}

export interface AuthResult {
    token: string;
    user: AuthUser;
}
