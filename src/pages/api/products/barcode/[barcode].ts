import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../prisma';
import middleware from '../../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['seller', 'admin', 'superadmin']))) {
    return res.status(403).end();
  }

  const productBarcode = req.query.barcode as string;

  if (req.method === 'GET') {
    await handleGET(productBarcode, res);
  } else if (req.method === 'DELETE') {
    await handleDELETE(productBarcode, res);
  } else {
    return res.status(405).end();
  }
}

// GET /api/products/:id
async function handleGET(productUuid: string, res: NextApiResponse) {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: productUuid }
    });

    if (!product) {
      return res.status(404).end();
    } else {
      return res.status(200).json({ data: product });
    }
  } catch (e) {
    return res.status(500).end();
  }
}

// DELETE /api/products/:id
async function handleDELETE(productUuid: string, res: NextApiResponse) {
  try {
    await prisma.product.delete({
      where: { barcode: productUuid }
    });

    return res.status(200).end();
  } catch (e) {
    return res.status(500).end();
  }
}
