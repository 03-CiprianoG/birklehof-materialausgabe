export default async function middleware(token, allowedRoles) {
  if (!token) {
    return false;
  }
  const { userRole } = token;
  console.log(userRole);
  return !!allowedRoles.includes(userRole);
}