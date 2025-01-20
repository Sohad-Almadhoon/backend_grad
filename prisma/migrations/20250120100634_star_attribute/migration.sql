/*
  Warnings:

  - Changed the type of `star` on the `Review` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "star",
ADD COLUMN     "star" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "Star";
