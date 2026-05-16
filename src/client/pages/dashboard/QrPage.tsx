import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useClipboard } from '../../lib/clipboard';
import type { QrPayload } from '../../../shared/schemas/admin';

export function QrPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'qr'],
    queryFn: () => apiFetch<QrPayload>('/admin/qr', { auth: true }),
  });
  const { copy, copied } = useClipboard();

  return (
    <section className="max-w-md mx-auto">
      {isLoading || !data ? (
        <p className="font-serif text-warmgray">Génération en cours…</p>
      ) : (
        <div className="rounded-2xl border border-sand/80 bg-white/95 p-8 shadow-sm shadow-espresso/5">
          <div className="flex justify-center mb-6">
            <img
              src={data.pngBase64}
              alt="QR code de la page scan"
              className="w-64 h-64 rounded-lg border border-deepspace/5"
            />
          </div>

          <p className="text-[10px] uppercase tracking-wider2 text-warmgray text-center mb-2">URL</p>
          <p className="font-mono text-sm text-deepspace text-center break-all mb-6 select-all">{data.url}</p>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={data.pngBase64}
              download="qr-code.png"
              className="px-4 py-2 rounded-full bg-orange text-cream text-xs uppercase tracking-wider2 hover:bg-orange-dark shadow-sm shadow-orange/20"
            >
              Télécharger PNG
            </a>
            <a
              href={`data:image/svg+xml;utf8,${encodeURIComponent(data.svg)}`}
              download="qr-code.svg"
              className="px-4 py-2 rounded-full border border-deepspace/15 text-xs uppercase tracking-wider2"
            >
              Télécharger SVG
            </a>
            <button
              onClick={() => copy(data.url, 'url')}
              className="px-4 py-2 rounded-full border border-deepspace/15 text-xs uppercase tracking-wider2"
            >
              {copied === 'url' ? 'Copié' : 'Copier l’URL'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
