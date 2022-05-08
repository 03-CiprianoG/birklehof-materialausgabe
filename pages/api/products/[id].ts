import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const productUuid = req.query.id

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

// GET /api/products/:id
async function handleGET(productUuid, res) {
  try {
    const product = await prisma.product.findUnique({
      where: { uuid: productUuid },
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

// PATCH /api/products/:id
async function handlePATCH(productUuid, res, req) {
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
      } catch (error) {
        res.status(500).json({ message: error.message })
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE /api/products/:id
async function handleDELETE(productUuid, res) {
  try {
    await prisma.product.delete({
      where: { uuid: productUuid },
    })
    res.status(200).json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
