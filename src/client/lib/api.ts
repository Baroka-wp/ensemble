// Tokens distincts : restaurant (admin) et influenceur. Permet d'ouvrir les 2 dans le même navigateur.
const RESTO_KEY = 'ir.token';
const INFLUENCER_KEY = 'ir.token.influencer';

interface Store {
  get: () => string | null;
  set: (t: string) => void;
  clear: () => void;
}

function makeStore(key: string): Store {
  return {
    get: () => (typeof window !== 'undefined' ? localStorage.getItem(key) : null),
    set: (t) => localStorage.setItem(key, t),
    clear: () => localStorage.removeItem(key),
  };
}

export const tokenStore = makeStore(RESTO_KEY);
export const influencerTokenStore = makeStore(INFLUENCER_KEY);

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** 'restaurant' (défaut si auth=true), 'influencer', ou false. */
  auth?: boolean | 'restaurant' | 'influencer';
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth) {
    const which = opts.auth === 'influencer' ? influencerTokenStore : tokenStore;
    const token = which.get();
    if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Non connecté');
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  const contentType = res.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    const code = data?.error ?? 'HTTP_ERROR';
    const message = data?.message ?? `Erreur ${res.status}`;
    // Auto-clear le token correspondant en cas de 401
    if (res.status === 401) {
      if (opts.auth === 'influencer') influencerTokenStore.clear();
      else if (opts.auth) tokenStore.clear();
    }
    throw new ApiError(res.status, code, message);
  }
  return data as T;
}
