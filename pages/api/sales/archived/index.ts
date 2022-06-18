import prisma from "../../prisma_client";
import {NextApiRequest, NextApiResponse} from "next";

// GET /api/sales
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const sales = await prisma.sale.findMany({
        where: {
          archived: true
        },
        include: {
          seller: true,
          itemsSold: true
        }
      })
      res.status(200).json({
        data: sales
      })
    } catch(e){
      res.status(500).end();
    }
  } else {
    res.status(405).end()
  }
}