import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// POST /api/products/create
// Required fields in body: barcode, name, price
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['admin', 'superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    const { barcode, name, price } = req.body;

    if (!barcode || !name || !price) {
      return res.status(400).json({
        error: 'Fehlende Angaben'
      });
    } else if (typeof barcode !== 'string') {
      return res.status(400).json({
        error: 'Barcode muss ein String sein'
      });
    } else if (typeof name !== 'string') {
      return res.status(400).json({
        error: 'Name muss ein String sein'
      });
    } else if (isNaN(+price)) {
      return res.status(400).json({
        error: 'Preis muss eine Zahl sein'
      });
    }

    try {
      await prisma.product.create({
        data: {
          barcode: barcode,
          name: name,
          price: +price
        }
      });
      return res.status(200).end();
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          return res.status(400).json({ message: 'Produkt existiert bereits' });
        }
      }
      return res.status(500).end();
    }
  } else {
    return res.status(405).end();
  }
}
