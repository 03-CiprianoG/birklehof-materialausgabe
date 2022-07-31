import { prisma } from '../../../../prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/users
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['superadmin']))) {
    res.status(403).end();
  }

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany();
      res.status(200).json({
        data: users
      });
    } catch (e) {
      res.status(500).end();
    }
  } else {
    res.status(405).end();
  }
}
