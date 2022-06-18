import prisma from "../prisma_client";
import {NextApiRequest, NextApiResponse} from "next";

// GET /api/users
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany()
      res.status(200).json({
        data: users
      })
    } catch(e){
      res.status(500).end();
    }
  } else {
    res.status(405).end()
  }
}