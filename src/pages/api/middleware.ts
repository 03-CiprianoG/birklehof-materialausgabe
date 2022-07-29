export default async function middleware(token, allowedRoles) {
  if (!token) {
    return false;
  }
  const { userRole } = token;
  return !!allowedRoles.includes(userRole);
}
