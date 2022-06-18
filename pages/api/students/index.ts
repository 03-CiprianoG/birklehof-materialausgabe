import prisma from "../prisma_client";
import {NextApiRequest, NextApiResponse} from "next";

// GET /api/students
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const students = await prisma.student.findMany()
      res.status(200).json({
        data: students
      })
    } catch(e){
      res.status(500).end();
    }
  } else {
    res.status(405).end()
  }
}