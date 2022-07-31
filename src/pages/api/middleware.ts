import { JWT } from 'next-auth/jwt';

export default async function middleware(token: JWT | null, allowedRoles: string[]) {
  if (!token) {
    return false;
  }
  const { userRole } = token;
  if (!userRole) {
    return false;
  }
  return allowedRoles.includes(userRole);
}
