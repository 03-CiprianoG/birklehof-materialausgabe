import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/auth/role
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req, secret });
  if (token) {
    res.send(JSON.stringify(token.userRole, null, 2));
  }
  res.status(401).end();
};
