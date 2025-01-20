/*
  Warnings:

  - A unique constraint covering the columns `[buyerId,cartItemId,carId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Order_buyerId_cartItemId_carId_key" ON "Order"("buyerId", "cartItemId", "carId");
