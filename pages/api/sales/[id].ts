import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const saleUuid = req.query.id

  if (req.method === 'GET') {
    await handleGET(saleUuid, res)
  } else if (req.method === 'DELETE') {
    await handleDELETE(saleUuid, res)
  } else {
    res.status(405).end()
  }
}

// GET /api/products/:id
async function handleGET(saleUuid, res) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { uuid: saleUuid },
    })
    if (!sale) {
      res.status(404).end()
    } else {
      res.status(200).json({ data: sale })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETE /api/products/:id
async function handleDELETE(saleUuid, res) {
  try {
    await prisma.item.deleteMany({
      where: { saleUuid: saleUuid },
    })
    await prisma.sale.delete({
      where: { uuid: saleUuid },
    })
    res.json({ message: 'Sale deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
