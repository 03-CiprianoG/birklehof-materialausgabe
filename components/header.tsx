import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"
import {useEffect, useState} from "react";
import logo from '../assets/birklehof-logo.png';
import Image from "next/image";
import { useRouter } from 'next/router';
import {
  IoHomeOutline,
  IoPeopleOutline,
  IoBagOutline,
  IoBusinessOutline,
  IoLogOutOutline,
  IoAlbumsOutline, IoAppsOutline
} from "react-icons/io5";

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const router = useRouter();
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
    <header className={styles.header}>
      <img className={styles.logo} src="https://www.birklehof.de/wp-content/themes/birklehof-v2/img/birklehof-logo.png" alt="Birklehof Logo" />
      <nav className={styles.nav}>
        <div className={styles.navItemsContainer}>
          <ul className={styles.navItems}>
            <li className={router.pathname == "/" ? styles.activeNavItem : styles.navItem}>
              <Link href="/" >
                <a className={styles.navLink}>Home</a>
              </Link>
              <Link href="/">
                <a>
                  <IoHomeOutline className={styles.navIcon}/>
                </a>
              </Link>
            </li>
            {(role == 'seller' || role == 'admin' || role == 'superadmin') && (
              <li  className={router.pathname.includes('/sales/create') ? styles.activeNavItem : styles.navItem}>
                <Link href="/sales/create">
                  <a className={styles.navLink}>Verkaufen</a>
                </Link>
                <Link href="/sales/create">
                  <a>
                    <IoBagOutline className={styles.navIcon} />
                  </a>
                </Link>
              </li>)}
            {(role == 'admin' || role == 'superadmin') && (
              <li  className={router.pathname.includes('/sales') && !router.pathname.includes('/sales/create') ? styles.activeNavItem : styles.navItem}>
                <Link href="/sales">
                  <a className={styles.navLink}>Verkäufe</a>
                </Link>
                <Link href="/sales">
                  <a>
                    <IoAlbumsOutline className={styles.navIcon} />
                  </a>
                </Link>
              </li>)}
            {(role == 'admin' || role == 'superadmin') && (
              <li className={router.pathname.includes('/products') ? styles.activeNavItem : styles.navItem}>
                <Link href="/products">
                  <a className={styles.navLink}>Produkte</a>
                </Link>
                <Link href="/products">
                  <a>
                    <IoAppsOutline className={styles.navIcon} />
                  </a>
                </Link>
              </li>)}
            {(role == 'admin' || role == 'superadmin') && (
              <li className={router.pathname.includes('/students') ? styles.activeNavItem : styles.navItem}>
                <Link href="/students">
                  <a className={styles.navLink}>Schüler</a>
                </Link>
                <Link href="/students">
                  <a>
                    <IoBusinessOutline className={styles.navIcon} />
                  </a>
                </Link>
              </li>)}
            {(role == 'superadmin') && (
              <li className={router.pathname.includes('/users') ? styles.activeNavItem : styles.navItem}>
                <Link href="/users">
                  <a className={styles.navLink}>Benutzer</a>
                </Link>
                <Link href="/users">
                  <a>
                    <IoPeopleOutline className={styles.navIcon} />
                  </a>
                </Link>
              </li>)}
          </ul>
        </div>
        <div className={styles.signedInStatus}>
          <p
            className={`nojs-show ${
              !session && loading ? styles.loading : styles.loaded
            }`}
          >
            {!session && (
              <>
              <span className={styles.notSignedInText}>
                Du bist nicht angemeldet
              </span>
                <a
                  href={`/api/auth/signin`}
                  className={styles.buttonPrimary}
                  onClick={(e) => {
                    e.preventDefault()
                    signIn()
                  }}
                >
                  Anmelden
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
                  <small>Angemeldet als</small>
                <br />
                <strong>{session.user.email ?? session.user.name}</strong>
              </span>
                <a
                  href={`/api/auth/signout`}
                  className={styles.button}
                  onClick={(e) => {
                    e.preventDefault()
                    signOut().then(() => document.location = "/")
                  }}
                >
                  <IoLogOutOutline className={styles.signOutIcon} />
                  <span className={styles.signOutText}>Abmelden</span>
                </a>
              </>
            )}
          </p>
        </div>
      </nav>
    </header>
  )
}
