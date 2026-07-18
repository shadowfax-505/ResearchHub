type JwtPayload = {
  role?: string;
  user_id?: number;
  username?: string;
  is_verified?: number | boolean;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

export function decodeTokenPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function getStoredSessionRole() {
  if (typeof window === 'undefined') return null;
  const storedRole = window.sessionStorage.getItem('researchhub_role');
  if (storedRole) return storedRole;
  const token = window.sessionStorage.getItem('researchhub_token');
  if (!token) return null;
  return decodeTokenPayload(token)?.role || null;
}

export function getStoredSessionIsVerified() {
  if (typeof window === 'undefined') return false;
  const token = window.sessionStorage.getItem('researchhub_token');
  if (!token) return false;
  return Boolean(decodeTokenPayload(token)?.is_verified);
}

export function hasStoredSession() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.sessionStorage.getItem('researchhub_token'));
}

export function getStoredSessionToken() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem('researchhub_token');
}

export function storeSession(token?: string | null, role?: string | null) {
  if (typeof window === 'undefined') return;
  if (token === null) {
    clearSession();
    return;
  }
  if (token) window.sessionStorage.setItem('researchhub_token', token);
  if (role) window.sessionStorage.setItem('researchhub_role', role);
  if (token && !role) {
    const payload = decodeTokenPayload(token);
    if (payload?.role) window.sessionStorage.setItem('researchhub_role', payload.role);
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem('researchhub_token');
  window.sessionStorage.removeItem('researchhub_role');
}
