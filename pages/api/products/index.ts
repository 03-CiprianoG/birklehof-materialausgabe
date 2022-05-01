import prisma from "../prisma_client";

export default async function handle(req, res) {
  const products = await prisma.product.findMany()

  if (products.length > 0) {
    res.json({
      data: products
    })
  } else {
    res.status(404).json({
      message: "No products found"
    })
  }
}