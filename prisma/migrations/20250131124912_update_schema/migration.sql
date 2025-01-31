/*
  Warnings:

  - You are about to drop the column `orderId` on the `Cart` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_orderId_fkey";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "orderId";
