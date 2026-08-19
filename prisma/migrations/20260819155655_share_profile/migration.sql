-- AlterTable
ALTER TABLE "users" ADD COLUMN     "share_id" TEXT,
ADD COLUMN     "share_politics" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_share_id_key" ON "users"("share_id");

