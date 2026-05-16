import { Link } from 'react-router-dom';
import { EnsembleMark } from '../../components/EnsembleMark';

type Intent = 'login' | 'register';

const CONFIG: Record<
  Intent,
  {
    title: string;
    subtitle: string;
    restaurant: { label: string; description: string; to: string; cta: string };
    influencer: { label: string; description: string; to: string; cta: string };
  }
> = {
  login: {
    title: 'Connexion',
    subtitle: 'Choisissez votre espace pour vous connecter.',
    restaurant: {
      label: 'Restaurant',
      description: 'Gérants et équipes — dashboard, QR, collaborations.',
      to: '/login',
      cta: 'Connexion restaurant',
    },
    influencer: {
      label: 'Influenceur',
      description: 'Créateurs — stats, scans et collaborations.',
      to: '/i/login',
      cta: 'Connexion influenceur',
    },
  },
  register: {
    title: 'Démarrer',
    subtitle: 'Créez votre compte selon votre profil.',
    restaurant: {
      label: 'Restaurant',
      description: 'Ouvrez votre espace et lancez vos campagnes en salle.',
      to: '/register',
      cta: 'Créer un restaurant',
    },
    influencer: {
      label: 'Influenceur',
      description: 'Rejoignez la plateforme et gérez vos collaborations.',
      to: '/i/register',
      cta: 'Créer un compte créateur',
    },
  },
};

function SpaceOption({
  to,
  eyebrow,
  title,
  description,
  cta,
  variant,
}: {
  to: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  variant: 'restaurant' | 'influencer';
}) {
  const isRestaurant = variant === 'restaurant';

  return (
    <Link
      to={to}
      className={[
        'group flex flex-col justify-between rounded-3xl border p-7 md:p-8 min-h-[200px] transition-all duration-300',
        'hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange/40',
        isRestaurant
          ? 'border-espresso bg-espresso text-cream shadow-lg shadow-espresso/20 hover:shadow-xl'
          : 'border-sand/80 bg-white text-espresso shadow-md hover:border-orange/30 hover:shadow-lg',
      ].join(' ')}
    >
      <div>
        <p
          className={[
            'text-[10px] uppercase tracking-[0.2em]',
            isRestaurant ? 'text-cream/50' : 'text-orange',
          ].join(' ')}
        >
          {eyebrow}
        </p>
        <h2 className="mt-3 font-sans text-2xl font-light tracking-wide">{title}</h2>
        <p
          className={[
            'mt-2 font-serif text-sm leading-relaxed',
            isRestaurant ? 'text-cream/70' : 'text-warmgray',
          ].join(' ')}
        >
          {description}
        </p>
      </div>
      <span
        className={[
          'mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em]',
          isRestaurant ? 'text-cream/80 group-hover:text-halo' : 'text-orange group-hover:text-orange-dark',
        ].join(' ')}
      >
        {cta}
        <span className="text-base transition-transform group-hover:translate-x-1" aria-hidden>
          →
        </span>
      </span>
    </Link>
  );
}

export function ChooseSpacePage({ intent }: { intent: Intent }) {
  const { title, subtitle, restaurant, influencer } = CONFIG[intent];

  return (
    <div className="min-h-screen bg-cream text-espresso">
      <header className="border-b border-sand/50 bg-cream/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="ensemble — accueil">
            <EnsembleMark className="h-5 w-5 shrink-0" />
            <span className="text-sm font-light tracking-[0.2em] uppercase">ensemble</span>
          </Link>
          <Link
            to="/"
            className="text-xs uppercase tracking-wider2 text-warmgray transition-colors hover:text-espresso"
          >
            ← Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <div className="text-center">
          <h1 className="font-sans text-3xl font-thin tracking-wide md:text-4xl">{title}</h1>
          <p className="mt-3 font-serif text-warmgray">{subtitle}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <SpaceOption
            to={restaurant.to}
            eyebrow="Gérants & équipes"
            title={restaurant.label}
            description={restaurant.description}
            cta={restaurant.cta}
            variant="restaurant"
          />
          <SpaceOption
            to={influencer.to}
            eyebrow="Partenaires"
            title={influencer.label}
            description={influencer.description}
            cta={influencer.cta}
            variant="influencer"
          />
        </div>
      </main>
    </div>
  );
}
