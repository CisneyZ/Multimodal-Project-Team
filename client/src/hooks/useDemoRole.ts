import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isAdminAuthenticated, ROLE_KEY } from './useAdminAuth';

export type DemoRole = 'admin' | 'reviewer' | 'newcomer';

export function useDemoRole(): { role: DemoRole; setRole: (r: DemoRole) => void } {
  const [searchParams, setSearchParams] = useSearchParams();

  const role: DemoRole = useMemo(() => {
    const fromUrl = searchParams.get('role');
    if (fromUrl === 'newcomer') {
      localStorage.setItem(ROLE_KEY, fromUrl);
      return fromUrl;
    }
    if ((fromUrl === 'admin' || fromUrl === 'reviewer') && isAdminAuthenticated()) {
      localStorage.setItem(ROLE_KEY, fromUrl);
      return fromUrl;
    }
    const fromStorage = localStorage.getItem(ROLE_KEY);
    if ((fromStorage === 'admin' || fromStorage === 'reviewer') && isAdminAuthenticated()) {
      return fromStorage;
    }
    return 'newcomer';
  }, [searchParams]);

  const setRole = (r: DemoRole) => {
    const nextRole = r === 'newcomer' || isAdminAuthenticated() ? r : 'newcomer';
    localStorage.setItem(ROLE_KEY, nextRole);
    if (nextRole === 'newcomer') {
      searchParams.delete('role');
    } else {
      searchParams.set('role', nextRole);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return { role, setRole };
}
