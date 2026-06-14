import { browser } from '$app/environment';
import type { User } from '$lib/types';

function createAuthStore() {
  let accessToken = $state<string | null>(null);
  let user = $state<User | null>(null);
  let loading = $state(false);

  async function login(email: string, password: string): Promise<void> {
    const apiUrl = browser ? (import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000') : '';
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? 'Login failed');
    }

    const data = await res.json();
    accessToken = data.accessToken;
    user = data.user;
  }

  async function logout(): Promise<void> {
    const apiUrl = browser ? (import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000') : '';
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });
    } finally {
      accessToken = null;
      user = null;
    }
  }

  async function refreshToken(): Promise<boolean> {
    const apiUrl = browser ? (import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000') : '';
    try {
      const res = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        accessToken = null;
        user = null;
        return false;
      }

      const data = await res.json();
      accessToken = data.accessToken;

      const meRes = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (meRes.ok) {
        user = await meRes.json();
      }

      return true;
    } catch {
      accessToken = null;
      user = null;
      return false;
    }
  }

  return {
    get accessToken() {
      return accessToken;
    },
    get user() {
      return user;
    },
    get loading() {
      return loading;
    },
    set loading(v: boolean) {
      loading = v;
    },
    login,
    logout,
    refreshToken,
  };
}

export const auth = createAuthStore();
