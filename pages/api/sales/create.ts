import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";

interface Item {
  barcode: string
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
        error: 'Missing required fields'
      })
      return
    } else if (typeof sellerEmail !== 'string' || typeof buyerName !== 'string' || typeof itemsSold !== 'object') {
      res.status(400).json({
        error: 'Invalid type for required fields'
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
              product: {
                connect: {
                  barcode: item.barcode
                }
              },
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
      console.log(e)
      if (e instanceof PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
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