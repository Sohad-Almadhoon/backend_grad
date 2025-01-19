/*
  Warnings:

  - The values [ONE,TWO,THREE,FOUR,FIVE] on the enum `Star` will be removed. If these variants are still used in the database, this will fail.
  - The values [AUTOMATIC,MANUAL] on the enum `Transmission` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `model` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartItemId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `battery` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carType` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `climate` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `range` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seats` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speed` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cartItemId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `whatsapp` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Star_new" AS ENUM ('One', 'Two', 'Three', 'Four', 'Five');
ALTER TABLE "Review" ALTER COLUMN "star" TYPE "Star_new" USING ("star"::text::"Star_new");
ALTER TYPE "Star" RENAME TO "Star_old";
ALTER TYPE "Star_new" RENAME TO "Star";
DROP TYPE "Star_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Transmission_new" AS ENUM ('Automatic', 'Manual');
ALTER TABLE "Car" ALTER COLUMN "transmission" TYPE "Transmission_new" USING ("transmission"::text::"Transmission_new");
ALTER TYPE "Transmission" RENAME TO "Transmission_old";
ALTER TYPE "Transmission_new" RENAME TO "Transmission";
DROP TYPE "Transmission_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_orderId_fkey";

-- AlterTable
ALTER TABLE "Car" DROP COLUMN "model",
ADD COLUMN     "battery" INTEGER NOT NULL,
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "carType" TEXT NOT NULL,
ADD COLUMN     "climate" INTEGER NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "range" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "seats" INTEGER NOT NULL,
ADD COLUMN     "speed" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "isCompleted",
DROP COLUMN "updatedAt",
ADD COLUMN     "cartItemId" INTEGER NOT NULL,
ADD COLUMN     "totalPrice" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "country",
ALTER COLUMN "whatsapp" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_cartItemId_key" ON "Order"("cartItemId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
