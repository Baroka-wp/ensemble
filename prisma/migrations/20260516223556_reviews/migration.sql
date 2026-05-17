-- DropForeignKey
ALTER TABLE "collaborations" DROP CONSTRAINT "collaborations_influencer_id_fkey";

-- DropForeignKey
ALTER TABLE "collaborations" DROP CONSTRAINT "collaborations_restaurant_id_fkey";

-- DropForeignKey
ALTER TABLE "scans" DROP CONSTRAINT "scans_collaboration_id_fkey";

-- AlterTable
ALTER TABLE "collaborations" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "scan_id" UUID NOT NULL,
    "fingerprint_hash" TEXT NOT NULL,
    "rating_ambiance" INTEGER NOT NULL,
    "rating_taste" INTEGER NOT NULL,
    "rating_service" INTEGER NOT NULL,
    "comment" TEXT,
    "hidden_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_scan_id_key" ON "reviews"("scan_id");

-- CreateIndex
CREATE INDEX "reviews_restaurant_id_created_at_idx" ON "reviews"("restaurant_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_restaurant_id_fingerprint_hash_key" ON "reviews"("restaurant_id", "fingerprint_hash");

-- AddForeignKey
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "uniq_collaboration_code_per_restaurant" RENAME TO "collaborations_restaurant_id_code_key";

-- RenameIndex
ALTER INDEX "uniq_collaboration_pair" RENAME TO "collaborations_influencer_id_restaurant_id_key";
