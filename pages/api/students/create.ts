import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../prisma_client'
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";

// POST /api/students/create
// Required fields in body: first name, second name, last name, grade
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { firstName, secondName, lastName, grade } = req.body

    if (!firstName || !secondName || !lastName || !grade) {
      res.status(400).json({
        error: 'Missing required fields'
      })
      return
    } else if (typeof firstName !== 'string' || typeof secondName !== 'string' || typeof lastName !== 'string' || typeof grade !== 'string') {
      res.status(400).json({
        error: 'Invalid type for required fields'
      })
      return
    }

    try {
      await prisma.student.create({
        data: {
          firstName,
          secondName,
          lastName,
          grade
        },
      })
      res.status(200).json({
        message: 'Student created',
      })
    } catch(e){
      if (e instanceof PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          res.status(500).json({ message: 'There is a unique constraint violation' });
        }
      }
      res.status(500).json({ message: 'An unknown error occurred while accessing the database' });
    }
  } else {
    res.status(405).end()
  }
}