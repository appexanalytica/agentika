// SSR-safe browser API helpers

export const isBrowser = typeof window !== "undefined";

export function getLocalStorageItem(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

export function setLocalStorageItem(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

export function removeLocalStorageItem(key: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

export function getWindowWidth(): number {
  if (!isBrowser) return 0;
  return window.innerWidth;
}

export function addWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void {
  if (!isBrowser) return;
  window.addEventListener(type, listener, options);
}

export function removeWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => void,
  options?: boolean | EventListenerOptions
): void {
  if (!isBrowser) return;
  window.removeEventListener(type, listener, options);
}

export function matchMedia(query: string): MediaQueryList | null {
  if (!isBrowser) return null;
  return window.matchMedia(query);
}

export function getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  if (!isBrowser) return null;
  return document.getElementById(id) as T | null;
}

export function setCookie(name: string, value: string, options?: { maxAge?: number; path?: string }): void {
  if (!isBrowser) return;
  let cookie = `${name}=${value}`;
  if (options?.maxAge) {
    cookie += `; max-age=${options.maxAge}`;
  }
  if (options?.path) {
    cookie += `; path=${options.path}`;
  }
  document.cookie = cookie;
}
