import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const productUuid: string = req.query.uuid.toString()

  if (req.method === 'GET') {
    await handleGET(productUuid, res)
  } else if (req.method === 'PATCH') {
    await handlePATCH(productUuid, res, req)
  } else if (req.method === 'DELETE') {
    await handleDELETE(productUuid, res)
  } else {
    res.status(405).end()
  }
}

// GET /api/products/:uuid
async function handleGET(productUuid: string, res: NextApiResponse) {
  try {
    const product = await prisma.product.findUnique({
      where: { uuid: productUuid },
    })
    if (!product) {
      res.status(404).end()
    } else {
      res.status(200).json({ data: product })
    }
  } catch(e){
    res.status(500).end();
  }
}

// PATCH /api/products/:uuid
async function handlePATCH(productUuid: string, res: NextApiResponse, req: NextApiRequest) {
  try {
    const product = await prisma.product.findUnique({
      where: { uuid: productUuid },
    })
    if (!product) {
      res.status(404).end()
    } else {
      try {
        const {barcode, name, price} = await req.body
        await prisma.product.update({
          where: { uuid: productUuid },
          data: {
            barcode,
            name,
            price: +price,
          }
        })
        res.status(200).json({ message: 'Product updated' })
      } catch(e){
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            res.status(400).json({ message: 'Produkt existiert bereits' });
          }
        }
        res.status(500).end();
      }
    }
  } catch(e){
    res.status(500).end();
  }
}

// DELETE /api/products/:uuid
async function handleDELETE(productUuid: string, res: NextApiResponse) {
  try {
    await prisma.product.delete({
      where: { uuid: productUuid },
    })
    res.status(200).json({ message: 'Product deleted' })
  } catch(e){
    res.status(500).end();
  }
}
