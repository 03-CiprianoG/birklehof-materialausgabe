import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'

// POST /api/products/create
// Required fields in body: barcode, name, price
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
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
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}