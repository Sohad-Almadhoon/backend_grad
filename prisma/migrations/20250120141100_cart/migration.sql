/*
  Warnings:

  - A unique constraint covering the columns `[carId,buyerId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cart_carId_buyerId_key" ON "Cart"("carId", "buyerId");
