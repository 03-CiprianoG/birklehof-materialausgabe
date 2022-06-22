import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const userUuid: string = req.query.uuid.toString()

  if (req.method === 'GET') {
    await handleGET(userUuid, res)
  } else if (req.method === 'PATCH') {
    await handlePATCH(userUuid, res, req)
  } if (req.method === 'DELETE') {
    await handleDELETE(userUuid, res)
  } else {
    res.status(405).end()
  }
}

// GET /api/users/:uuid
async function handleGET(userUuid: string, res: NextApiResponse) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
    })
    if (!user) {
      res.status(404).end()
    } else {
      res.status(200).json({ data: user })
    }
  } catch(e){
    res.status(500).end();
  }
}

// PATCH /api/users/:uuid
async function handlePATCH(userUuid: string, res: NextApiResponse, req: NextApiRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
    })
    if (!user) {
      res.status(404).end()
    } else if (user.role == 'superadmin') {
      res.status(403).end()
    } else {
      try {
        const {name, email, role} = await req.body

        if (!name || !email || !role) {
          res.status(400).json({
            error: 'Fehlende Angaben'
          })
          return
        } else if (typeof name !== 'string') {
          res.status(400).json({
            error: 'Name muss ein String sein'
          })
          return
        }  else if (typeof email !== 'string') {
          res.status(400).json({
            error: 'E-Mail muss ein String sein'
          })
          return
        }  else if (typeof role !== 'string') {
          res.status(400).json({
            error: 'Rolle muss ein String sein'
          })
          return
        } else if (role !== 'admin' && role !== 'seller') {
          res.status(400).json({
            error: 'Rolle muss Admin oder Verkäufer sein'
          })
          return
        }

        await prisma.user.update({
          where: { uuid: userUuid },
          data: {
            name,
            email,
            role,
          }
        })
        res.status(200).end();
      } catch(e){
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            res.status(400).json({ message: 'Benutzer existiert bereits' });
          }
        }
        res.status(500).end();
      }
    }
  } catch(e){
    res.status(500).end();
  }
}

// DELETE /api/users/:uuid
async function handleDELETE(userUuid: string, res: NextApiResponse) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
    })

    if (!user) {
      res.status(404).end()
    } else if (user.role == 'superadmin') {
      res.status(403).end()
    }

    await prisma.user.delete({
      where: { uuid: userUuid },
    })
    res.json({ message: 'User deleted' })
  } catch(e){
    res.status(500).end();
  }
}
