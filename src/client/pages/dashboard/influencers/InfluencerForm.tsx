import { useState, type FormEvent } from 'react';
import { Field, TextInput, PrimaryButton, ErrorBanner } from '../../auth/AuthLayout';
import { formatFCFA } from '../../../../shared/schemas/influencer';
import { normalizePromoCode } from '../../../../shared/promoCode';
import { PromoCodeField } from '../../../components/PromoCodeField';

export interface InfluencerFormValues {
  displayName: string;
  email: string;
  password?: string;
  code: string;
  discountPercent: number;
  rewardPerScanXof: number;
  isActive?: boolean;
}

interface Props {
  initial?: Partial<InfluencerFormValues>;
  submitLabel: string;
  /** Affiche les champs email + mot de passe (création) ou mot de passe optionnel (édition). */
  mode: 'create' | 'edit';
  isPending: boolean;
  error: string | null;
  onSubmit: (values: InfluencerFormValues) => void;
}

export function InfluencerForm({ initial, submitLabel, mode, isPending, error, onSubmit }: Props) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [password, setPassword] = useState('');
  const [discountPercent, setDiscountPercent] = useState(
    initial?.discountPercent !== undefined ? String(initial.discountPercent) : '15',
  );
  const [rewardXof, setRewardXof] = useState(
    initial?.rewardPerScanXof !== undefined ? String(initial.rewardPerScanXof) : '500',
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const rewardNum = Math.max(0, Math.round(Number(rewardXof.replace(',', '.'))) || 0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const values: InfluencerFormValues = {
      displayName: displayName.trim(),
      code: normalizePromoCode(code),
      email: email.trim().toLowerCase(),
      discountPercent: Number(discountPercent),
      rewardPerScanXof: rewardNum,
    };
    if (password) values.password = password;
    if (mode === 'edit') values.isActive = isActive;
    onSubmit(values);
  };

  return (
    <form onSubmit={submit} noValidate>
      {error && <ErrorBanner message={error} />}

      <Field label="Nom de l’influenceur">
        <TextInput
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Marie"
          required
        />
      </Field>

      <Field
        label="Code promo"
        hint={
          mode === 'create'
            ? 'Saisissez un code personnalisé ou générez-en un. Laissez vide pour un code aléatoire à la création.'
            : 'Modifiable : les clients saisissent ce code sur la page scan.'
        }
      >
        <PromoCodeField value={code} onChange={setCode} disabled={isPending} />
      </Field>

      <Field label="Email de connexion" hint="L’influenceur l’utilisera pour se connecter à son espace.">
        <TextInput
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="marie@example.com"
          required
        />
      </Field>

      <Field
        label={mode === 'create' ? 'Mot de passe initial' : 'Nouveau mot de passe (optionnel)'}
        hint={
          mode === 'create'
            ? 'Communiquez-le à l’influenceur. 8 caractères minimum.'
            : 'Laisser vide pour ne pas changer.'
        }
      >
        <TextInput
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={mode === 'create'}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Réduction client" hint="Entre 5 et 50 %.">
          <div className="relative">
            <TextInput
              type="number"
              min={5}
              max={50}
              step={1}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgray text-sm">%</span>
          </div>
        </Field>

        <Field label="Gain par scan" hint="En FCFA, montant entier.">
          <div className="relative">
            <TextInput
              type="number"
              min={0}
              max={50000}
              step={50}
              value={rewardXof}
              onChange={(e) => setRewardXof(e.target.value)}
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgray text-sm">FCFA</span>
          </div>
        </Field>
      </div>

      {rewardNum > 0 && (
        <p className="font-serif text-sm text-warmgray -mt-2 mb-5">
          Indicatif : 10 scans × {formatFCFA(rewardNum)} = {formatFCFA(rewardNum * 10)}.
        </p>
      )}

      {mode === 'edit' && (
        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-orange"
          />
          <span className="text-sm">Code actif</span>
        </label>
      )}

      <PrimaryButton type="submit" disabled={isPending}>
        {isPending ? 'Enregistrement…' : submitLabel}
      </PrimaryButton>
    </form>
  );
}
