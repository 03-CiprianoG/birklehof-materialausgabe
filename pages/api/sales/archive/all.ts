import prisma from "../../prisma_client";
import {NextApiRequest, NextApiResponse} from "next";

// POST /api/sales/archive/all
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const [sales, _] = await prisma.$transaction([
        prisma.sale.findMany({
          where: {
            archived: false
          },
          include: {
            seller: true,
            itemsSold: true
          }
        }),
        prisma.sale.updateMany({
          where: {
            archived: false
          },
          data: {
            archived: true,
            archivedAt: new Date()
          }
        }),
      ])
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