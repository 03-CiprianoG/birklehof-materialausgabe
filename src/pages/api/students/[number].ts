import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../prismaClient';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['admin', 'superadmin']))) {
    res.status(403).end();
  }

  const studentNumber: string = req.query.number.toString();

  if (req.method === 'DELETE') {
    await handleDELETE(studentNumber, res);
  } else {
    res.status(405).end();
  }
}

// DELETE /api/students/:uuid
async function handleDELETE(studentNumber: string, res: NextApiResponse) {
  try {
    await prisma.student.delete({
      where: { number: parseInt(studentNumber) }
    });
    res.status(200).end();
  } catch (e) {
    res.status(500).end();
  }
}
