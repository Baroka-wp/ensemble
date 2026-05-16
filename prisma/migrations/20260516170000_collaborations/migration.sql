-- Migration v3 : influenceurs autonomes + collaborations restaurant ↔ influenceur.
-- Préserve les données existantes : chaque influenceur historique devient une collaboration `active`
-- avec son restaurant courant, en reportant code / discount / reward / created_at.

-- 1. Enum statut
CREATE TYPE "collaboration_status" AS ENUM (
  'pending',
  'active',
  'rejected',
  'paused_by_inf',
  'paused_by_resto'
);

-- 2. Table collaborations
CREATE TABLE "collaborations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "influencer_id" UUID NOT NULL,
  "restaurant_id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "discount_percent" INTEGER,
  "reward_per_scan_xof" INTEGER,
  "status" "collaboration_status" NOT NULL DEFAULT 'pending',
  "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "decided_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "collaborations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "collaborations_influencer_id_fkey"
    FOREIGN KEY ("influencer_id") REFERENCES "influencers"("id") ON DELETE CASCADE,
  CONSTRAINT "collaborations_restaurant_id_fkey"
    FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "uniq_collaboration_pair"
  ON "collaborations"("influencer_id", "restaurant_id");
CREATE UNIQUE INDEX "uniq_collaboration_code_per_restaurant"
  ON "collaborations"("restaurant_id", "code");
CREATE INDEX "collaborations_influencer_id_idx"
  ON "collaborations"("influencer_id");
CREATE INDEX "collaborations_restaurant_id_status_idx"
  ON "collaborations"("restaurant_id", "status");

-- 3. Backfill : 1 collaboration `active` par influenceur historique.
-- Les anciens influenceurs étaient liés à 1 restaurant, on conserve cette relation.
INSERT INTO "collaborations" (
  "id", "influencer_id", "restaurant_id",
  "code", "discount_percent", "reward_per_scan_xof",
  "status", "requested_at", "decided_at", "created_at"
)
SELECT
  gen_random_uuid(),
  i."id",
  i."restaurant_id",
  i."code",
  i."discount_percent",
  i."reward_per_scan_xof",
  'active'::"collaboration_status",
  i."created_at",
  i."created_at",
  i."created_at"
FROM "influencers" i;

-- 4. Ajoute collaboration_id sur scans (nullable au début pour pouvoir backfill).
ALTER TABLE "scans" ADD COLUMN "collaboration_id" UUID;

-- 5. Backfill scans.collaboration_id en suivant l'influencer + restaurant courants.
-- Chaque scan a un influencer_id ; on retrouve la collab via (influencer_id, restaurant_id).
UPDATE "scans" s
SET "collaboration_id" = c."id"
FROM "collaborations" c
WHERE c."influencer_id" = s."influencer_id"
  AND c."restaurant_id" = s."restaurant_id";

-- 6. Vérif intégrité : aucun scan ne doit avoir collaboration_id NULL après backfill.
-- Si la migration trouve une incohérence, on échoue ici plutôt que de continuer aveugle.
DO $$
DECLARE
  orphans INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphans FROM "scans" WHERE "collaboration_id" IS NULL;
  IF orphans > 0 THEN
    RAISE EXCEPTION 'Migration abort: % scans without collaboration_id', orphans;
  END IF;
END $$;

-- 7. Rend collaboration_id NOT NULL et ajoute la FK + index.
ALTER TABLE "scans" ALTER COLUMN "collaboration_id" SET NOT NULL;
ALTER TABLE "scans" ADD CONSTRAINT "scans_collaboration_id_fkey"
  FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE CASCADE;
CREATE INDEX "scans_collaboration_id_created_at_idx"
  ON "scans"("collaboration_id", "created_at" DESC);

-- 8. Drop l'ancien index + FK + colonne influencer_id sur scans.
DROP INDEX IF EXISTS "scans_influencer_id_created_at_idx";
ALTER TABLE "scans" DROP CONSTRAINT IF EXISTS "scans_influencer_id_fkey";
ALTER TABLE "scans" DROP COLUMN "influencer_id";

-- 9. Allège la table influencers (compte autonome désormais).
ALTER TABLE "influencers" DROP CONSTRAINT IF EXISTS "influencers_restaurant_id_fkey";
DROP INDEX IF EXISTS "uniq_influencer_code_per_restaurant";
DROP INDEX IF EXISTS "influencers_restaurant_id_idx";
ALTER TABLE "influencers" DROP COLUMN "restaurant_id";
ALTER TABLE "influencers" DROP COLUMN "code";
ALTER TABLE "influencers" DROP COLUMN "discount_percent";
ALTER TABLE "influencers" DROP COLUMN "reward_per_scan_xof";
