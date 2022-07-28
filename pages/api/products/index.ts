import prisma from "../../../prismaClient";
import {NextApiRequest, NextApiResponse} from "next";
import middleware from "../middleware";
import {getToken} from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET

// GET /api/products
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!await middleware(await getToken({ req, secret }), ['admin', 'superadmin'])) {
    res.status(403).end();
  }

  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany()
      res.json({
        data: products
      })
    } catch(e){
      res.status(500).end();
    }
  } else {
    res.status(405).end()
  }
}