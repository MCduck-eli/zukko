export interface User {
    id: string;
    email: string;
    fullName: string;
    createdAt: Date;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    user?: Partial<User>;
    token?: string;
}
