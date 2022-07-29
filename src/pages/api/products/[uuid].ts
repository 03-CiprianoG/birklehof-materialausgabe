import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../prismaClient';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['admin', 'superadmin']))) {
    res.status(403).end();
  }

  const productUuid: string = req.query.uuid.toString();

  if (req.method === 'GET') {
    await handleGET(productUuid, res);
  } else if (req.method === 'PATCH') {
    await handlePATCH(productUuid, res, req);
  } else if (req.method === 'DELETE') {
    await handleDELETE(productUuid, res);
  } else {
    res.status(405).end();
  }
}

// GET /api/products/:uuid
async function handleGET(productUuid: string, res: NextApiResponse) {
  try {
    const product = await prisma.product.findUnique({
      where: { uuid: productUuid }
    });
    if (!product) {
      res.status(404).end();
    } else {
      res.status(200).json({ data: product });
    }
  } catch (e) {
    res.status(500).end();
  }
}

// PATCH /api/products/:uuid
async function handlePATCH(productUuid: string, res: NextApiResponse, req: NextApiRequest) {
  try {
    const product = await prisma.product.findUnique({
      where: { uuid: productUuid }
    });
    if (!product) {
      res.status(404).end();
    } else {
      try {
        const { barcode, name, price } = await req.body;

        if (!barcode || !name || !price) {
          res.status(400).json({
            error: 'Fehlende Angaben'
          });
          return;
        } else if (typeof barcode !== 'string') {
          res.status(400).json({
            error: 'Barcode muss ein String sein'
          });
          return;
        } else if (typeof name !== 'string') {
          res.status(400).json({
            error: 'Name muss ein String sein'
          });
          return;
        } else if (isNaN(+price)) {
          res.status(400).json({
            error: 'Preis muss eine Zahl sein'
          });
          return;
        }

        await prisma.product.update({
          where: { uuid: productUuid },
          data: {
            barcode,
            name,
            price: +price
          }
        });
        res.status(200).json({ message: 'Product updated' });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            res.status(400).json({ message: 'Produkt existiert bereits' });
          }
        }
        res.status(500).end();
      }
    }
  } catch (e) {
    res.status(500).end();
  }
}

// DELETE /api/products/:uuid
async function handleDELETE(productUuid: string, res: NextApiResponse) {
  try {
    await prisma.product.delete({
      where: { uuid: productUuid }
    });
    res.status(200).end();
  } catch (e) {
    res.status(500).end();
  }
}
