import { useState } from 'react';
import { useAudience } from './AudienceContext';

const COMMON_FAQ = [
  {
    q: 'Combien ça coûte ?',
    a: 'Pour les restaurants, l’offre pilote d’août coûte 125 000 FCFA : configuration, QR, intégration de trois créateurs maximum, suivi pendant 30 jours et bilan. Le compte créateur reste gratuit.',
  },
  {
    q: 'Faut-il installer une application ?',
    a: 'Non. Les clients utilisent simplement leur appareil photo pour scanner le QR. Le restaurant et l’influenceur gèrent tout depuis leur navigateur, sur mobile ou ordinateur.',
  },
  {
    q: 'Quels appareils sont supportés ?',
    a: 'Tout smartphone récent (iOS ou Android) avec un navigateur à jour. Le ticket s’affiche en plein écran, lisible à 1 mètre par le caissier.',
  },
  {
    q: 'Mes données sont-elles à moi ?',
    a: 'Oui. Tous les scans, codes et statistiques de votre restaurant ou compte vous appartiennent. Aucune revente ni croisement avec d’autres bases.',
  },
];

const RESTO_FAQ = [
  {
    q: 'Comment je vérifie un ticket en caisse ?',
    a: 'Le client présente son écran. Vous voyez le pourcentage de réduction et un code TKT-XXXX-XXXX lisible. Validation visuelle, comme un bon papier — sauf qu’il ne peut être réutilisé qu’une fois.',
  },
  {
    q: 'Qu’est-ce qui empêche un client de réutiliser son code ?',
    a: 'Une empreinte non lisible de son appareil est calculée au premier scan. Sur votre établissement, ce même appareil ne peut obtenir qu’une réduction sur une période de 24 heures.',
  },
  {
    q: 'Si un influenceur quitte mon restaurant, que se passe-t-il ?',
    a: 'Vous pouvez mettre la collaboration en pause à tout moment. Son code devient inutilisable immédiatement. L’historique des scans déjà validés est conservé pour vos stats.',
  },
  {
    q: 'Combien de campagnes en parallèle ?',
    a: 'Autant que vous voulez. Un seul QR en salle gère tous vos influenceurs simultanément — c’est le code saisi par le client qui détermine qui est crédité.',
  },
];

const INF_FAQ = [
  {
    q: 'Faut-il un minimum d’abonnés pour s’inscrire ?',
    a: 'Non. Vous pouvez créer un compte avec n’importe quelle taille d’audience. C’est le restaurant qui décide d’accepter ou non votre demande de collaboration.',
  },
  {
    q: 'Comment suis-je payé ?',
    a: 'C’est le restaurant qui vous règle directement, selon les modalités convenues avec lui. La plateforme suit le décompte exact des scans validés et le total dû en FCFA.',
  },
  {
    q: 'Et si plusieurs influenceurs ont le même code ?',
    a: 'Impossible : chaque code est unique pour un restaurant donné. Vous pouvez personnaliser le vôtre tant qu’il n’est pas déjà pris.',
  },
  {
    q: 'Puis-je mettre en pause sans tout supprimer ?',
    a: 'Oui. Vous pouvez désactiver une collaboration en un clic depuis votre espace. Vos scans passés et vos gains restent visibles dans l’historique.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="group border-b border-sand/60 py-5 sm:py-6 last:border-b-0"
    >
      <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
        <h3 className="font-sans text-base text-espresso font-medium sm:text-lg">{q}</h3>
        <span
          className={[
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-espresso/15 text-espresso transition-transform',
            open ? 'rotate-45 bg-orange text-cream border-orange' : 'bg-white/60',
          ].join(' ')}
          aria-hidden
        >
          <span className="text-base leading-none">+</span>
        </span>
      </summary>
      <p className="mt-3 max-w-3xl font-serif text-sm leading-relaxed text-warmgray sm:text-[15px]">
        {a}
      </p>
    </details>
  );
}

export function FaqSection() {
  const { audience } = useAudience();
  const specific = audience === 'restaurant' ? RESTO_FAQ : INF_FAQ;
  const all = [...COMMON_FAQ, ...specific];

  return (
    <section
      id="faq"
      className="scroll-mt-20 bg-cream py-16 sm:scroll-mt-24 sm:py-20 md:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-5 md:px-8">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-orange">FAQ</p>
          <h2 className="mt-3 font-sans text-2xl font-thin tracking-wide text-espresso sm:text-3xl md:text-4xl">
            Tout ce qu’il faut savoir avant de se lancer.
          </h2>
        </div>
        <div key={audience} className="mt-10 animate-[fadeIn_0.3s_ease-out]">
          {all.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
