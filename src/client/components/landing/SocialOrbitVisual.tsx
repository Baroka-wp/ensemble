import type { ReactNode } from 'react';
import { EnsembleMark } from '../EnsembleMark';

type SocialIcon = {
  name: string;
  label: string;
  color: string;
  angle: number;
  path: ReactNode;
};

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconSnapchat() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.513 0 .285.031.531.076.772.104.52.27.893.465 1.303.192.395.412.853.533 1.447.09.42.12.892.09 1.358-.028.416-.12.84-.28 1.23-.32.78-.89 1.36-1.568 1.736-.66.37-1.44.56-2.242.56h-.01c-.17 0-.34-.01-.51-.03l-.06-.01c-.15-.02-.3-.04-.45-.04-.22 0-.44.03-.65.09-.42.11-.8.32-1.1.6-.45.4-.75.95-.85 1.55-.05.3-.07.61-.06.92.01.15.02.3.05.45.06.35.17.68.32.98.08.16.18.31.29.45-.52.28-1.12.42-1.72.42-.6 0-1.2-.14-1.72-.42.11-.14.21-.29.29-.45.15-.3.26-.63.32-.98.03-.15.04-.3.05-.45.01-.31-.01-.62-.06-.92-.1-.6-.4-1.15-.85-1.55-.3-.28-.68-.49-1.1-.6-.21-.06-.43-.09-.65-.09-.15 0-.3.02-.45.04l-.06.01c-.17.02-.34.03-.51.03h-.01c-.8 0-1.58-.19-2.24-.56-.68-.38-1.25-.96-1.57-1.74-.16-.39-.25-.81-.28-1.23-.03-.47-.03-.94.09-1.36.12-.59.34-1.05.53-1.45.2-.41.36-.78.47-1.3.04-.24.08-.49.08-.77 0-.17-.01-.33-.03-.51l-.06-.06c-.1-1.63-.23-3.65.3-4.85C3.66 1.07 7.04.79 8.03.79h4.18l-.004.003z" />
    </svg>
  );
}

const OUTER_ICONS: SocialIcon[] = [
  { name: 'instagram', label: 'Instagram', color: 'text-[#E4405F]', angle: 0, path: <IconInstagram /> },
  { name: 'tiktok', label: 'TikTok', color: 'text-espresso', angle: 60, path: <IconTikTok /> },
  { name: 'youtube', label: 'YouTube', color: 'text-[#FF0000]', angle: 120, path: <IconYoutube /> },
  { name: 'facebook', label: 'Facebook', color: 'text-[#1877F2]', angle: 180, path: <IconFacebook /> },
  { name: 'x', label: 'X', color: 'text-espresso', angle: 240, path: <IconX /> },
  { name: 'snapchat', label: 'Snapchat', color: 'text-[#FFFC00]', angle: 300, path: <IconSnapchat /> },
];

const INNER_ICONS: SocialIcon[] = [
  { name: 'tiktok-i', label: 'TikTok', color: 'text-espresso', angle: 30, path: <IconTikTok /> },
  { name: 'instagram-i', label: 'Instagram', color: 'text-[#E4405F]', angle: 150, path: <IconInstagram /> },
  { name: 'youtube-i', label: 'YouTube', color: 'text-[#FF0000]', angle: 270, path: <IconYoutube /> },
];

const OUTER_DURATION = 28;
const INNER_DURATION = 22;

function orbitDelay(angle: number, duration: number) {
  return `${-((angle / 360) * duration).toFixed(2)}s`;
}

function OrbitIcon({
  icon,
  variant,
}: {
  icon: SocialIcon;
  variant: 'outer' | 'inner';
}) {
  const duration = variant === 'outer' ? OUTER_DURATION : INNER_DURATION;
  return (
    <div
      className={[
        'absolute left-1/2 top-1/2 h-0 w-0',
        variant === 'outer' ? 'animate-orbit-outer' : 'animate-orbit-inner',
      ].join(' ')}
      style={{ animationDelay: orbitDelay(icon.angle, duration) }}
    >
      <div
        className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white/90 bg-white shadow-lg shadow-espresso/10 sm:h-11 sm:w-11 sm:rounded-2xl [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-5 sm:[&_svg]:w-5"
        title={icon.label}
      >
        <span className={icon.color}>{icon.path}</span>
      </div>
    </div>
  );
}

export function SocialOrbitVisual() {
  return (
    <div
      className="orbit-visual relative mx-auto h-[min(300px,78vw)] w-[min(300px,78vw)] max-w-[420px] sm:h-[min(340px,82vw)] sm:w-[min(340px,82vw)] md:h-[min(380px,85vw)] md:w-[min(380px,85vw)]"
      aria-hidden
    >
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-orange/25 via-terracotta/10 to-transparent blur-2xl animate-shimmer" />
      <div className="absolute inset-[10%] rounded-full border border-dashed border-orange/30 animate-spin-slow" />
      <div className="absolute inset-[22%] rounded-full border border-sand/80 bg-white/40" />

      {OUTER_ICONS.map((icon) => (
        <OrbitIcon key={icon.name} icon={icon} variant="outer" />
      ))}
      {INNER_ICONS.map((icon) => (
        <OrbitIcon key={icon.name} icon={icon} variant="inner" />
      ))}

      <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-gradient-to-br from-white to-linen shadow-[0_20px_60px_-20px_rgba(249,115,22,0.5)] sm:h-28 sm:w-28 md:h-32 md:w-32">
        <span className="absolute inset-0 rounded-full bg-orange/15 animate-ping" />
        <EnsembleMark className="relative h-12 w-12 text-espresso sm:h-14 sm:w-14 md:h-16 md:w-16" />
      </div>

      <p className="absolute bottom-0 left-1/2 w-full max-w-[14rem] -translate-x-1/2 px-2 text-center text-[9px] uppercase leading-snug tracking-[0.18em] text-warmgray sm:max-w-none sm:text-[10px] sm:tracking-[0.2em]">
        Vos créateurs, tous les réseaux
      </p>
    </div>
  );
}
