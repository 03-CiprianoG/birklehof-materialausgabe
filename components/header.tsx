import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"
import {useEffect, useState} from "react";

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [role, setRole] = useState('guest');

  useEffect(() => {
    const fetchRole = async () => {
      const res = await fetch("/api/auth/role");
      if (res.status === 200) {
        const json = await res.json()
        setRole(json)
      } else {
        console.log("An unknown error occurred")
      }
    }
    fetchRole()
  }, [session])

  // Get the user role from /api/auth/role

  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.signedInStatus}>
        <p
          className={`nojs-show ${
            !session && loading ? styles.loading : styles.loaded
          }`}
        >
          {!session && (
            <>
              <span className={styles.notSignedInText}>
                You are not signed in
              </span>
              <a
                href={`/api/auth/signin`}
                className={styles.buttonPrimary}
                onClick={(e) => {
                  e.preventDefault()
                  signIn()
                }}
              >
                Sign in
              </a>
            </>
          )}
          {session?.user && (
            <>
              {session.user.image && (
                <span
                  style={{ backgroundImage: `url('${session.user.image}')` }}
                  className={styles.avatar}
                />
              )}
              <span className={styles.signedInText}>
                <small>Signed in as</small>
                <br />
                <strong>{session.user.email ?? session.user.name}</strong>
              </span>
              <a
                href={`/api/auth/signout`}
                className={styles.button}
                onClick={(e) => {
                  e.preventDefault()
                  signOut()
                }}
              >
                Sign out
              </a>
            </>
          )}
        </p>
      </div>
      <nav>
        <ul className={styles.navItems}>
          <li className={styles.navItem}>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          {role == 'admin' && (
            <li className={styles.navItem}>
              <Link href="/sales">
                <a>Sales</a>
              </Link>
            </li>)}
          {role == 'seller' || role == 'admin' && (
            <li className={styles.navItem}>
              <Link href="/products">
                <a>Products</a>
              </Link>
            </li>)}
          Role: {role}
        </ul>
      </nav>
    </header>
  )
}
