import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

interface Item {
  barcode: string;
  name: string;
  quantity: number;
  price: number;
}

// POST /api/sales/create
// Required fields in body: sellers email, buyers name, items sold
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['seller', 'admin', 'superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    const { sellerEmail, buyerName, itemsSold } = req.body;

    if (!sellerEmail || !buyerName || !itemsSold || itemsSold.length === 0) {
      return res.status(400).json({
        error: 'Fehlende Angaben'
      });
    } else if (typeof sellerEmail !== 'string') {
      return res.status(400).json({
        error: 'Verkäufer E-Mail muss ein String sein'
      });
    } else if (typeof buyerName !== 'string') {
      return res.status(400).json({
        error: 'Käufer Name muss ein String sein'
      });
    } else if (typeof itemsSold !== 'object') {
      return res.status(400).json({
        error: 'Verkaufte Produkte muss ein Array sein'
      });
    }

    try {
      await prisma.sale.create({
        data: {
          buyerName: buyerName,
          seller: {
            connect: {
              email: sellerEmail
            }
          },
          itemsSold: {
            create: itemsSold.map((item: Item) => ({
              productName: item.name + ' (' + item.barcode + ')',
              quantity: +item.quantity,
              pricePerUnit: +item.price
            }))
          }
        }
      });
      return res.status(200).end();
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          return res.status(400).json({ message: 'Verletzung der Einzigartigkeit' });
        }
      }
      return res.status(500).end();
    }
  } else {
    return res.status(405).end();
  }
}
