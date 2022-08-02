import { prisma } from '../../../../prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/sales
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['admin', 'superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'GET') {
    try {
      const sales = await prisma.sale.findMany({
        where: {
          archived: false
        },
        include: {
          seller: true,
          itemsSold: true
        },
        orderBy: {
          soldAt: 'desc'
        }
      });
      return res.status(200).json({
        data: sales
      });
    } catch (e) {
      return res.status(500).end();
    }
  } else {
    return res.status(405).end();
  }
}
