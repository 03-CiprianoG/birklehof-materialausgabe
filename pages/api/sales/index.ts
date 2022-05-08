import prisma from "../prisma_client";

export default async function handle(req, res) {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        seller: true,
        itemsSold: {
          include: {
            product: true
          }
        },
      }
    })
    res.status(200).json({
      data: sales
    })
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}