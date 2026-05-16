import { useState } from 'react';

export function useClipboard(resetMs = 1500) {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(value: string, key = value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), resetMs);
    } catch {
      // ignore — fallback non implémenté en MVP
    }
  }
  return { copy, copied };
}
