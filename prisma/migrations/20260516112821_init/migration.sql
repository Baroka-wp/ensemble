-- CreateTable
CREATE TABLE "restaurants" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencers" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "reward_per_scan_xof" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scans" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "influencer_id" UUID NOT NULL,
    "fingerprint_hash" TEXT NOT NULL,
    "reward_xof" INTEGER NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "scan_id" UUID NOT NULL,
    "ticket_code" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_blocks" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "fingerprint_hash" TEXT NOT NULL,
    "blocked_until" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_email_key" ON "restaurants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_email_key" ON "influencers"("email");

-- CreateIndex
CREATE INDEX "influencers_restaurant_id_idx" ON "influencers"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_restaurant_id_code_key" ON "influencers"("restaurant_id", "code");

-- CreateIndex
CREATE INDEX "scans_restaurant_id_created_at_idx" ON "scans"("restaurant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "scans_influencer_id_created_at_idx" ON "scans"("influencer_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_scan_id_key" ON "tickets"("scan_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticket_code_key" ON "tickets"("ticket_code");

-- CreateIndex
CREATE INDEX "device_blocks_restaurant_id_fingerprint_hash_blocked_until_idx" ON "device_blocks"("restaurant_id", "fingerprint_hash", "blocked_until");

-- CreateIndex
CREATE UNIQUE INDEX "device_blocks_restaurant_id_fingerprint_hash_key" ON "device_blocks"("restaurant_id", "fingerprint_hash");

-- AddForeignKey
ALTER TABLE "influencers" ADD CONSTRAINT "influencers_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_blocks" ADD CONSTRAINT "device_blocks_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
