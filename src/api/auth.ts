import client from './client';
import type { AuthResponse, LoginBody, RegisterBody, User } from '../types';

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/register', body);
  return data;
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/login', body);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await client.get<User>('/users/me');
  return data;
}
