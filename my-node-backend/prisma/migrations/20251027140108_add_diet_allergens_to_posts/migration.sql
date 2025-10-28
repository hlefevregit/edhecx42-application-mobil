-- AlterTable
ALTER TABLE "KnorrPost" ADD COLUMN     "allergens" TEXT,
ADD COLUMN     "dietType" TEXT,
ADD COLUMN     "isAllergenFree" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "KnorrPost_dietType_idx" ON "KnorrPost"("dietType");
