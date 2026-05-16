import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ScanCreatedEvent } from '../../shared/schemas/scan';
import { playScanChime } from './notificationSound';

interface AdminOpts {
  kind: 'admin';
  token: string;
}
interface InfluencerOpts {
  kind: 'influencer';
  token: string;
}
type Opts = AdminOpts | InfluencerOpts;

interface UseScanSocketResult {
  connected: boolean;
  lastScan: ScanCreatedEvent | null;
}

export function useScanSocket(opts: Opts | null, onScan?: (event: ScanCreatedEvent) => void): UseScanSocketResult {
  const [connected, setConnected] = useState(false);
  const [lastScan, setLastScan] = useState<ScanCreatedEvent | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!opts) return;
    const path = opts.kind === 'admin' ? '/admin' : '/influencer';

    const socket: Socket = io(path, {
      auth: { token: opts.token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('scan:created', (event: ScanCreatedEvent) => {
      setLastScan(event);
      playScanChime();
      onScanRef.current?.(event);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [opts?.kind, opts?.token]);

  return { connected, lastScan };
}
