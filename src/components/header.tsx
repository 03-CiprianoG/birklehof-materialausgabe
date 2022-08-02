import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  IoAddOutline,
  IoAlbumsOutline,
  IoArchiveOutline,
  IoCloudDownloadOutline,
  IoCloudUploadOutline,
  IoPersonAddOutline,
  IoChevronDownOutline
} from 'react-icons/io5';
import styles from './header.module.css';
import { useToasts } from 'react-toast-notifications';

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [role, setRole] = useState('guest');
  const { addToast } = useToasts();

  useEffect(() => {
    const fetchRole = async () => {
      const res = await fetch('/api/auth/role');
      if (res.status === 200) {
        const json = await res.json();
        setRole(json);
      } else {
        addToast('Fehler bei der Autentifizierung', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    };
    fetchRole();
  }, [session]);

  return (
    <div className={styles.topnav} id={'myTopnav'}>
      <div className={styles.navItem}>
        <button
          onClick={(e) => {
            e.preventDefault();
            window.open('https://www.birklehof.de/', '_blank');
          }}
        >
          Birklehof
        </button>
      </div>
      {router.pathname !== '/auth/signin' && (
        <>
          {(role == 'seller' || role == 'admin' || role == 'superadmin') && (
            <div className={styles.navItem}>
              <Link href={'/sales/create'}>
                <button className={router.pathname == '/sales/create' ? ' ' + styles.active : ''}>Verkaufen</button>
              </Link>
            </div>
          )}
          {role == 'seller' && (
            <Link href={'/products'}>
              <a className={router.pathname == '/products' ? ' ' + styles.active : ''}>Produkte</a>
            </Link>
          )}
          {(role == 'admin' || role == 'superadmin') && (
            <div className={styles.navItem}>
              <button
                className={
                  styles.dropdownButton +
                  (router.pathname.includes('/sales') && !router.pathname.includes('/sales/create')
                    ? ' ' + styles.active
                    : '')
                }
              >
                <IoChevronDownOutline /> Verkäufe
              </button>
              <div className={styles.dropdownContent}>
                <Link href={'/sales'}>
                  <a>
                    <IoAlbumsOutline /> Einsehen
                  </a>
                </Link>
                <Link href={'/sales/archived'}>
                  <a>
                    <IoArchiveOutline /> Archivierte
                  </a>
                </Link>
                {role === 'superadmin' && (
                  <Link href={'/sales/export'}>
                    <a>
                      <IoCloudDownloadOutline /> Exportieren
                    </a>
                  </Link>
                )}
              </div>
            </div>
          )}
          {(role == 'admin' || role == 'superadmin') && (
            <div className={styles.navItem}>
              <button
                className={styles.dropdownButton + (router.pathname.includes('/products') ? ' ' + styles.active : '')}
              >
                <IoChevronDownOutline /> Produkte
              </button>
              <div className={styles.dropdownContent}>
                <Link href={'/products'}>
                  <a>
                    <IoAlbumsOutline /> Einsehen
                  </a>
                </Link>
                <Link href={'/products/create'}>
                  <a>
                    <IoAddOutline /> Hinzufügen
                  </a>
                </Link>
                <Link href={'/products/import'}>
                  <a>
                    <IoCloudUploadOutline /> Importieren
                  </a>
                </Link>
              </div>
            </div>
          )}
          {(role == 'admin' || role == 'superadmin') && (
            <div className={styles.navItem}>
              <button
                className={styles.dropdownButton + (router.pathname.includes('/students') ? ' ' + styles.active : '')}
              >
                <IoChevronDownOutline /> Schüler
              </button>
              <div className={styles.dropdownContent}>
                <Link href={'/students'}>
                  <a>
                    <IoAlbumsOutline /> Einsehen
                  </a>
                </Link>
                <Link href={'/students/import'}>
                  <a>
                    <IoCloudUploadOutline /> Importieren
                  </a>
                </Link>
              </div>
            </div>
          )}
          {role == 'superadmin' && (
            <div className={styles.navItem}>
              <button
                className={styles.dropdownButton + (router.pathname.includes('/users') ? ' ' + styles.active : '')}
              >
                <IoChevronDownOutline /> Benutzer
              </button>
              <div className={styles.dropdownContent}>
                <Link href={'/users'}>
                  <a>
                    <IoAlbumsOutline /> Einsehen
                  </a>
                </Link>
                <Link href={'/users/create'}>
                  <a>
                    <IoPersonAddOutline /> Erstellen
                  </a>
                </Link>
              </div>
            </div>
          )}
          {session && (
            <div className={styles.navItem}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  signOut().then(() => (document.location = '/'));
                }}
              >
                Abmelden
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
