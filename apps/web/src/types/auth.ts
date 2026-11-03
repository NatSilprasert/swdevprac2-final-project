export type Role = "admin" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** `data` of POST /auth/login and /auth/register */
export interface AuthResponse extends User {
  token: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  tel: string;
  role: Role;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
