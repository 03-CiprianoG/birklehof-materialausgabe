import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../prisma_client'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const saleUuid: string = req.query.uuid.toString()

  if (req.method === 'PATCH') {
    await handlePATCH(saleUuid, res)
  } else {
    res.status(405).end()
  }
}

// PATCH /api/sales/archive/:uuid
async function handlePATCH(saleUuid: string, res: NextApiResponse) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { uuid: saleUuid },
    })
    if (!sale) {
      res.status(404).end()
    } else {
      await prisma.sale.update({
        where: { uuid: saleUuid },
        data: {
          archived: true,
          archivedAt: new Date(),
        },
      })
      res.json({ message: 'Sale archived' })
    }
  } catch(e){
    console.log(e)
    res.status(500).json({ message: 'An unknown error occurred while accessing the database' });
  }
}
