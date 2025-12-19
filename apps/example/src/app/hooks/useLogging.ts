import { useEffect, useState } from 'react';

const STORAGE_KEY = 'datatable-logging';

export function useLogging() {
  const [loggingEnabled, setLoggingEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, loggingEnabled ? 'true' : 'false');
      } catch {
        // ignore storage errors
      }
    }
  }, [loggingEnabled]);

  return {
    loggingEnabled,
    setLoggingEnabled,
  };
}
