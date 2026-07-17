import { useCallback, useEffect, useState } from 'react';

export const ADMIN_AUTH_KEY = 'starxAdminAuthenticated';
export const ROLE_KEY = 'demoRole';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const AUTH_CHANGE_EVENT = 'starx-admin-auth-change';

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminAuthenticated());

  useEffect(() => {
    const sync = () => setIsAuthenticated(isAdminAuthenticated());

    window.addEventListener('storage', sync);
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
    };
  }, []);

  const login = useCallback((username: string, password: string) => {
    const passed = username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    if (!passed) return false;

    window.localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    window.localStorage.setItem(ROLE_KEY, 'admin');
    setIsAuthenticated(true);
    notifyAuthChange();
    return true;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    window.localStorage.setItem(ROLE_KEY, 'newcomer');
    setIsAuthenticated(false);
    notifyAuthChange();
  }, []);

  return { isAuthenticated, login, logout };
}
