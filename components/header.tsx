import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
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
  IoAlbumsOutline,
  IoAppsOutline,
  IoCloudDownloadOutline,
  IoCloudUploadOutline,
  IoPersonAddOutline,
  IoTrashOutline,
  IoChevronDownOutline, IoMenuOutline, IoLogInOutline, IoAddOutline, IoArchiveOutline
} from "react-icons/io5";
import styles from './header.module.css';

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

  const toggleResponsive = async () => {
    var x = document.getElementById("myTopnav");
    if (x.className === styles.topnav) {
      x.className += ' ' + styles.topnavResponsive;
    } else {
      x.className = styles.topnav;
    }
  }

  return (
    <div>
      <div className={styles.topnav} id="myTopnav">
        <Link href="/" >
          <a className={router.pathname == '/' ? ' ' + styles.active : ''}><IoHomeOutline/> Home</a>
        </Link>
        {(role == 'seller' || role == 'admin' || role == 'superadmin') && (
        <Link href="/sales/create">
          <a className={router.pathname == '/sales/create' ? ' ' + styles.active : ''}><IoBagOutline/> Verkaufen</a>
        </Link>)}
        {(role == 'admin' || role == 'superadmin') && (<div className={styles.dropdown}>
          <button className={styles.dropdownButton + (router.pathname.includes('/sales') && !router.pathname.includes('/sales/create') ? ' ' + styles.active : '')}>Verkäufe
            <IoChevronDownOutline/>
          </button>
          <div className={styles.dropdownContent}>
            <Link href="/sales">
              <a><IoAlbumsOutline/> Einsehen</a>
            </Link>
            <Link href="/sales/archived">
              <a><IoArchiveOutline/> Archivierte</a>
            </Link>
            <Link href="/sales/export">
              <a><IoCloudDownloadOutline/> Exportieren</a>
            </Link>
          </div>
        </div>)}
        {(role == 'admin' || role == 'superadmin') && (<div className={styles.dropdown}>
          <button className={styles.dropdownButton + (router.pathname.includes('/products') ? ' ' + styles.active : '')}>Produkte
            <IoChevronDownOutline/>
          </button>
          <div className={styles.dropdownContent}>
            <Link href="/products">
              <a><IoAlbumsOutline/> Einsehen</a>
            </Link>
            <Link href="/products/create">
              <a><IoAddOutline/> Hinzufügen</a>
            </Link>
            <Link href="/products/import">
              <a><IoCloudUploadOutline/> Importieren</a>
            </Link>
            <Link href="/products/import">
              <a><IoTrashOutline/> Löschen</a>
            </Link>
          </div>
        </div>)}
        {(role == 'admin' || role == 'superadmin') && (<div className={styles.dropdown}>
          <button className={styles.dropdownButton + (router.pathname.includes('/students') ? ' ' + styles.active : '')}>Schüler
            <IoChevronDownOutline/>
          </button>
          <div className={styles.dropdownContent}>
            <Link href="/students">
              <a><IoAlbumsOutline/> Einsehen</a>
            </Link>
            <Link href="/students/import">
              <a><IoCloudUploadOutline/> Importieren</a>
            </Link>
            <Link href="/students/import">
              <a><IoTrashOutline/> Löschen</a>
            </Link>
          </div>
        </div>)}
        {(role == 'superadmin') && (<div className={styles.dropdown}>
          <button className={styles.dropdownButton + (router.pathname.includes('/users') ? ' ' + styles.active : '')}>Benutzer
            <IoChevronDownOutline/>
          </button>
          <div className={styles.dropdownContent}>
            <Link href="/users">
              <a><IoAlbumsOutline/> Einsehen</a>
            </Link>
            <Link href="/users/create">
              <a><IoPersonAddOutline/> Erstellen</a>
            </Link>
          </div>
        </div>)}
        <a className={styles.icon} onClick={toggleResponsive}>
          <IoMenuOutline/>
        </a>
        {!session && (<a
          href={`/api/auth/signin`}
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          <IoLogOutOutline/> Anmelden
        </a>)}
        {session && (<a
          href={`/api/auth/signout`}
          onClick={(e) => {
            e.preventDefault()
            signOut().then(() => document.location = "/")
          }}
        >
          <IoLogOutOutline /> Abmelden
        </a>)}
      </div>
      {/*<div className={styles.signedInStatus}>
        <p
          className={`nojs-show ${
            !session && loading ? styles.loading : styles.loaded
          }`}
        >
          {!session && (
            <>
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
      </div>*/}
    </div>
  )
}
