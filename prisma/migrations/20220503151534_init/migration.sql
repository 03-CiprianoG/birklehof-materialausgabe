-- CreateTable
CREATE TABLE "Product" (
    "uuid" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Item" (
    "uuid" TEXT NOT NULL,
    "productUuid" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "saleUuid" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Sale" (
    "uuid" TEXT NOT NULL,
    "sellerEmail" TEXT NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_productUuid_key" ON "Item"("productUuid");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_productUuid_fkey" FOREIGN KEY ("productUuid") REFERENCES "Product"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_saleUuid_fkey" FOREIGN KEY ("saleUuid") REFERENCES "Sale"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
