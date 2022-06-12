import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";

// POST /api/products/create
// Required fields in body: barcode, name, price
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { barcode, name, price } = req.body

    if (!barcode || !name || !price) {
      res.status(400).json({
        error: 'Missing required fields'
      })
      return
    } else if (typeof barcode !== 'string' || typeof name !== 'string' || isNaN(+price)) {
      res.status(400).json({
        error: 'Invalid type for required fields'
      })
      return
    }

    try {
      await prisma.product.create({
        data: {
          barcode: barcode,
          name: name,
          price: +price
        },
      })
      res.json({
        message: 'Product created'
      })
    } catch(e){
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          res.status(500).json({ message: 'There is a unique constraint violation' });
        }
      }
      res.status(500).json({ message: 'An unknown error occurred while accessing the database' });
    }
  } else {
    res.status(405).end()
  }
}