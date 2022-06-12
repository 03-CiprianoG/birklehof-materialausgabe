import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const studentUuid: string = req.query.uuid.toString()

  if (req.method === 'DELETE') {
    await handleDELETE(studentUuid, res)
  } else {
    res.status(405).end()
  }
}

// DELETE /api/students/:uuid
async function handleDELETE(studentUuid: string, res: NextApiResponse) {
  try {
    await prisma.student.delete({
      where: { uuid: studentUuid },
    })
    res.json({ message: 'Student deleted' })
  } catch(e){
    res.status(500).json({ message: 'An unknown error occurred while accessing the database' });
  }
}
