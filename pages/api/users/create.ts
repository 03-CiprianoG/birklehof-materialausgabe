import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";

// POST /api/users/create
// Required fields in body: name, email, role
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, role } = req.body

    if (!name || !email || !role) {
      res.status(400).json({
        error: 'Missing required fields'
      })
      return
    } else if (typeof name !== 'string' || typeof email !== 'string' || typeof role !== 'string') {
      res.status(400).json({
        error: 'Invalid type for required fields'
      })
      return
    } else if (role !== 'admin' && role !== 'seller') {
      res.status(400).json({
        error: 'Invalid role'
      })
      return
    }

    try {
      await prisma.user.create({
        data: {
          name: name,
          email: email,
          role: role
        },
      })
      res.status(200).json({
        message: 'User created',
      })
    } catch(e){
      if (e instanceof PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          res.status(400).json({ message: 'Benutzer existiert bereits' });
        }
      }
      res.status(500).end();
    }
  } else {
    res.status(405).end()
  }
}