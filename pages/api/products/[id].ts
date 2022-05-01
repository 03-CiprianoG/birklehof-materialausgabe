import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const productId = req.query.id

  if (req.method === 'GET') {
    await handleGET(productId, res)
  } else if (req.method === 'DELETE') {
    await handleDELETE(productId, res)
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    )
  }
}

// GET /api/products/:id
async function handleGET(productId, res) {
  const product = await prisma.product.findUnique({
    where: { uuid: productId },
  })
  res.json({ data: product })
}

// DELETE /api/products/:id
async function handleDELETE(productId, res) {
  const product = await prisma.product.delete({
    where: { uuid: productId },
  })
  res.json({ message: 'Product deleted', data: product })
}
