import prisma from "../prisma_client";

export default async function handle(req, res) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany()
      res.json({
        data: products
      })
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  } else {
    res.status(405).end()
  }
}