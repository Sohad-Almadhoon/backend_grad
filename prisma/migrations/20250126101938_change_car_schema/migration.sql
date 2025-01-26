/*
  Warnings:

  - You are about to drop the column `fuelType` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `speed` on the `Car` table. All the data in the column will be lost.
  - Changed the type of `climate` on the `Car` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Car" DROP COLUMN "fuelType",
DROP COLUMN "speed",
DROP COLUMN "climate",
ADD COLUMN     "climate" BOOLEAN NOT NULL;
