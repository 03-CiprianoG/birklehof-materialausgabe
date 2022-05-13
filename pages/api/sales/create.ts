import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'

// POST /api/products/create
// Required fields in body: barcode, name, price
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
            create: itemsSold.map(item => ({
              product : {
                connect: {
                  barcode: item.barcode
                }
              },
              quantity: +item.quantity,
              pricePerUnit: +item.price,
              totalPrice: +item.quantity * +item.price
            }))
          }
        },
      })
      res.status(200).json({
        message: 'Sale created',
      })
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  } else {
    res.status(405).end()
  }
}