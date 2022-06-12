import prisma from "../prisma_client";
import {NextApiRequest, NextApiResponse} from "next";

// GET /api/sales
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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
    } catch(e){
      res.status(500).json({ message: 'An unknown error occurred while accessing the database' });
    }
  } else {
    res.status(405).end()
  }
}