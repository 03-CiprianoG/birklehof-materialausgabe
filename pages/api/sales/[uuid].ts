import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const saleUuid: string = req.query.uuid.toString()

  if (req.method === 'GET') {
    await handleGET(saleUuid, res)
  } else if (req.method === 'DELETE') {
    await handleDELETE(saleUuid, res)
  } else {
    res.status(405).end()
  }
}

// GET /api/sales/:uuid
async function handleGET(saleUuid: string, res: NextApiResponse) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { uuid: saleUuid },
    })
    if (!sale) {
      res.status(404).end()
    } else {
      res.status(200).json({ data: sale })
    }
  } catch(e){
    res.status(500).end();
  }
}

// DELETE /api/sales/:uuid
async function handleDELETE(saleUuid: string, res: NextApiResponse) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { uuid: saleUuid },
    });

    if (!sale) {
      res.status(404).end()
    } else if (sale.archived) {
      res.status(400).json({ message: 'Sale already archived' })
    }

    await prisma.item.deleteMany({
      where: { saleUuid: saleUuid },
    })
    await prisma.sale.delete({
      where: { uuid: saleUuid },
    })
    res.json({ message: 'Sale deleted' })
  } catch(e){
    res.status(500).end();
  }
}
