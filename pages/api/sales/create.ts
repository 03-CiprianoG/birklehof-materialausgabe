import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";

interface Item {
  barcode: string
  name: string
  quantity: number
  price: number
}

// POST /api/sales/create
// Required fields in body: sellers email, buyers name, items sold
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sellerEmail, buyerName, itemsSold } = req.body

    if (!sellerEmail || !buyerName || !itemsSold || itemsSold.length === 0) {
      res.status(400).json({
        error: 'Fehlende Angaben'
      })
      return
    } else if (typeof sellerEmail !== 'string') {
      res.status(400).json({
        error: 'Verkäufer E-Mail muss ein String sein'
      })
      return
    } else if (typeof buyerName !== 'string') {
      res.status(400).json({
        error: 'Käufer Name muss ein String sein'
      })
      return
    } else if (typeof itemsSold !== 'object') {
      res.status(400).json({
        error: 'Verkaufte Produkte muss ein Array sein'
      })
      return
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
              pricePerUnit: +item.price,
            }))
          }
        },
      })
      res.status(200).json({
        message: 'Sale created',
      })
    }  catch(e){
      if (e instanceof PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          res.status(400).json({ message: 'Verletzung der Einzigartigkeit' });
        }
      }
      res.status(500).end();
    }
  } else {
    res.status(405).end()
  }
}