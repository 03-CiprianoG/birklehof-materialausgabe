import 'next-auth/jwt';

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth/jwt' {
  interface JWT {
    /** The user's role. */
    userRole: string | 'seller' | 'admin' | 'superadmin';
  }
}

declare module 'next-auth/react' {}
