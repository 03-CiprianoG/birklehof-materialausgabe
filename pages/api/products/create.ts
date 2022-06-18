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
        error: 'Fehlende Angaben'
      })
      return
    } else if (typeof barcode !== 'string') {
      res.status(400).json({
        error: 'Barcode muss ein String sein'
      })
      return
    } else if (typeof name !== 'string') {
      res.status(400).json({
        error: 'Name muss ein String sein'
      })
      return
    } else if (isNaN(+price)) {
      res.status(400).json({
        error: 'Preis muss eine Zahl sein'
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
      res.status(200).end()
    } catch(e){
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          res.status(400).json({ message: 'Produkt existiert bereits' });
        }
      }
      res.status(500).end();
    }
  } else {
    res.status(405).end()
  }
}