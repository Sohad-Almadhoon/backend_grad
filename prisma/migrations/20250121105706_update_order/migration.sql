/*
  Warnings:

  - You are about to drop the column `quantity` on the `Car` table. All the data in the column will be lost.
  - Added the required column `quantityInStock` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Car" DROP COLUMN "quantity",
ADD COLUMN     "quantityInStock" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "quantity" INTEGER NOT NULL;
