import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../prisma_client'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const productBarcode = req.query.barcode as string

  if (req.method === 'GET') {
    await handleGET(productBarcode, res)
  } else if (req.method === 'DELETE') {
    await handleDELETE(productBarcode, res)
  } else {
    res.status(405).end()
  }
}

// GET /api/products/:id
async function handleGET(productUuid, res) {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: productUuid },
    })
    if (!product) {
      res.status(404).end()
    } else {
      res.status(200).json({ data: product })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE /api/products/:id
async function handleDELETE(productUuid, res) {
  try {
    await prisma.product.delete({
      where: { barcode: productUuid },
    })
    res.status(200).json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
