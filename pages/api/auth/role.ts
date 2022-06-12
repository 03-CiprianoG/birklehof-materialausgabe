// This is an example of how to read a JSON Web Token from an API route
import { getToken } from "next-auth/jwt"
import type { NextApiRequest, NextApiResponse } from "next"

const secret = process.env.NEXTAUTH_SECRET

// GET /api/auth/role
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req, secret })
  if (!token) {
    res.send(JSON.stringify("guest", null, 2))
  } else
  {
    res.send(JSON.stringify(token.userRole, null, 2))
  }
}