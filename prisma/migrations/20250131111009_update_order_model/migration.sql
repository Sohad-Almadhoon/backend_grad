/*
  Warnings:

  - You are about to drop the column `cartItemId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentIntent` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[buyerId,carId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_cartItemId_fkey";

-- DropIndex
DROP INDEX "Order_buyerId_cartItemId_carId_key";

-- DropIndex
DROP INDEX "Order_cartItemId_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cartItemId",
DROP COLUMN "paymentIntent";

-- CreateIndex
CREATE UNIQUE INDEX "Order_buyerId_carId_key" ON "Order"("buyerId", "carId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
