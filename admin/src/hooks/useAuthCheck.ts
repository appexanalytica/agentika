import { useEffect } from 'react';
import { store } from '@/lib/store';

export function useAuthCheck() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && !store.getState().authed) {
        store.login();
      }
    }
  }, []);
}
