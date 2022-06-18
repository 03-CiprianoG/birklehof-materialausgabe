import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const studentNumber: string = req.query.number.toString()

  if (req.method === 'DELETE') {
    await handleDELETE(studentNumber, res)
  } else {
    res.status(405).end()
  }
}

// DELETE /api/students/:uuid
async function handleDELETE(studentNumber: string, res: NextApiResponse) {
  try {
    await prisma.student.delete({
      where: { number: parseInt(studentNumber) },
    })
    res.json({ message: 'Student deleted' })
  } catch(e){
    res.status(500).end();
  }
}
