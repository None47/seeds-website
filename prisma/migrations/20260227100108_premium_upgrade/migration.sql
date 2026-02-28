/*
  Warnings:

  - You are about to drop the column `pdfData` on the `Invoice` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "orderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditTransaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerGstin" TEXT NOT NULL,
    "buyerGstin" TEXT NOT NULL,
    "placeOfSupply" TEXT NOT NULL,
    "subtotal" REAL NOT NULL,
    "cgst" REAL NOT NULL,
    "sgst" REAL NOT NULL,
    "igst" REAL NOT NULL,
    "totalTax" REAL NOT NULL,
    "grandTotal" REAL NOT NULL,
    "invoiceDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("buyerGstin", "buyerId", "cgst", "createdAt", "grandTotal", "id", "igst", "invoiceDate", "invoiceNumber", "orderId", "placeOfSupply", "sellerGstin", "sgst", "subtotal", "totalTax") SELECT "buyerGstin", "buyerId", "cgst", "createdAt", "grandTotal", "id", "igst", "invoiceDate", "invoiceNumber", "orderId", "placeOfSupply", "sellerGstin", "sgst", "subtotal", "totalTax" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "buyerState" TEXT NOT NULL,
    "notes" TEXT,
    "totalAmount" REAL NOT NULL,
    "gstAmount" REAL NOT NULL,
    "grandTotal" REAL NOT NULL,
    "trackingId" TEXT,
    "shippingCarrier" TEXT,
    "shippingDetails" TEXT,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "paidViaCredit" REAL NOT NULL DEFAULT 0,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("buyerId", "buyerState", "createdAt", "grandTotal", "gstAmount", "id", "notes", "orderNumber", "status", "totalAmount", "updatedAt") SELECT "buyerId", "buyerState", "createdAt", "grandTotal", "gstAmount", "id", "notes", "orderNumber", "status", "totalAmount", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropName" TEXT NOT NULL,
    "varietyName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageBase64" TEXT,
    "germinationPct" REAL NOT NULL,
    "purityPct" REAL NOT NULL,
    "yieldPerAcre" TEXT NOT NULL,
    "suitableSeason" TEXT NOT NULL,
    "suitableRegions" TEXT NOT NULL,
    "description" TEXT,
    "lotNumber" TEXT NOT NULL,
    "batchId" TEXT,
    "manufacturingDate" TEXT,
    "expiryDate" TEXT,
    "dateOfTesting" TEXT NOT NULL,
    "hsnCode" TEXT NOT NULL,
    "gstRate" REAL NOT NULL DEFAULT 0,
    "moq" INTEGER NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "tierPricing" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "createdAt", "cropName", "dateOfTesting", "description", "germinationPct", "gstRate", "hsnCode", "id", "imageUrl", "isActive", "lotNumber", "moq", "purityPct", "stockQuantity", "suitableRegions", "suitableSeason", "tierPricing", "updatedAt", "varietyName", "yieldPerAcre") SELECT "category", "createdAt", "cropName", "dateOfTesting", "description", "germinationPct", "gstRate", "hsnCode", "id", "imageUrl", "isActive", "lotNumber", "moq", "purityPct", "stockQuantity", "suitableRegions", "suitableSeason", "tierPricing", "updatedAt", "varietyName", "yieldPerAcre" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'buyer',
    "companyName" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "state" TEXT,
    "district" TEXT,
    "pincode" TEXT,
    "address" TEXT,
    "gstCertificate" TEXT,
    "kycStatus" TEXT NOT NULL DEFAULT 'pending',
    "kycRejectionReason" TEXT,
    "kycApprovedAt" DATETIME,
    "creditLimit" REAL NOT NULL DEFAULT 0,
    "usedCredit" REAL NOT NULL DEFAULT 0,
    "outstandingBalance" REAL NOT NULL DEFAULT 0,
    "creditEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("address", "companyName", "createdAt", "district", "email", "gstCertificate", "gstNumber", "id", "kycStatus", "panNumber", "password", "pincode", "role", "state", "updatedAt") SELECT "address", "companyName", "createdAt", "district", "email", "gstCertificate", "gstNumber", "id", "kycStatus", "panNumber", "password", "pincode", "role", "state", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
