import prisma from "../prisma_client";
import {NextApiRequest, NextApiResponse} from "next";

// GET /api/products
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany()
      res.json({
        data: products
      })
    } catch(e){
      res.status(500).json({ message: 'An unknown error occurred while accessing the database' });
    }
  } else {
    res.status(405).end()
  }
}