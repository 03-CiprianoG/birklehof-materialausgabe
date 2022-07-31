import { prisma } from '../../../../prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/products
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['seller', 'admin', 'superadmin']))) {
    res.status(403).end();
  }

  if (req.method === 'GET') {
    try {
      // Needs to use a custom query because the sort by prisma is case-sensitive
      const products = await prisma.$queryRaw`SELECT "public"."Product"."uuid", "public"."Product"."barcode", "public"."Product"."name", "public"."Product"."price" FROM "public"."Product" WHERE 1=1 ORDER BY LOWER("public"."Product"."name") ASC`;
      res.json({ data: products });
    } catch (e) {
      res.status(500).end();
    }
  } else {
    res.status(405).end();
  }
}
