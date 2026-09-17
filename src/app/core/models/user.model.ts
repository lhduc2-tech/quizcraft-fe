export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  authProvider: 'LOCAL' | 'GOOGLE';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserProfile;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  fullName?: string;
}

export interface GoogleLoginPayload {
  idToken: string;
}
