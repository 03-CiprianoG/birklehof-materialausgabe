import prisma from '../../../../../prismaClient';
import { NextApiRequest, NextApiResponse } from 'next';
import middleware from '../../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// POST /api/sales/archive/all
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['superadmin']))) {
    res.status(403).end();
  }

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
        })
      ]);
      res.status(200).json({
        data: sales
      });
    } catch (e) {
      res.status(500).end();
    }
  } else {
    res.status(405).end();
  }
}
