import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  IoAddOutline,
  IoAlbumsOutline,
  IoArchiveOutline,
  IoCloudUploadOutline,
  IoPersonAddOutline,
  IoChevronDownOutline,
  IoMenuOutline,
  IoLinkOutline,
  IoCloudDownloadOutline,
  IoLogOutOutline,
  IoCartOutline,
  IoLibraryOutline
} from 'react-icons/io5';
import styles from './header.module.css';
import { useToasts } from 'react-toast-notifications';
import HeaderItem from './header/headerItem';

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [role, setRole] = useState('');
  const { addToast } = useToasts();

  useEffect(() => {
    const fetchRole = async () => {
      const res = await fetch('/api/auth/role');
      if (res.status === 200) {
        const json = await res.json();
        setRole(json);
      } else {
        addToast('Fehler bei der Authentifizierung', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    };
    fetchRole();
  }, [session]);

  const handleSignOut = async (e: any) => {
    await signOut();
    document.location.href = '/';
  };

  const nav = (
    <>
      <HeaderItem href={'https://www.birklehof.de/'} target={'_blank'} text={'Birklehof'} icon={<IoLinkOutline />} />
      {router.pathname !== '/auth/signin' && (
        <>
          {(role == 'seller' || role == 'admin' || role == 'superadmin') && (
            <HeaderItem href={'/sell'} text={'Verkaufen'} icon={<IoCartOutline />} />
          )}
          {role == 'seller' && <HeaderItem href={'/products'} text={'Produkte'} icon={<IoLibraryOutline />} />}
          {(role == 'admin' || role == 'superadmin') && (
            <HeaderItem text={'Verkäufe'} href={'/sales'} icon={<IoChevronDownOutline />}>
              <HeaderItem href={'/sales'} text={'Einsehen'} icon={<IoAlbumsOutline />} />
              <HeaderItem href={'/sales/archived'} text={'Archivierte'} icon={<IoArchiveOutline />} />
              <HeaderItem href={'/sales/export'} text={'Exportieren'} icon={<IoCloudDownloadOutline />} />
            </HeaderItem>
          )}
          {(role == 'admin' || role == 'superadmin') && (
            <HeaderItem text={'Produkte'} href={'/products'} icon={<IoChevronDownOutline />}>
              <HeaderItem href={'/products'} text={'Einsehen'} icon={<IoAlbumsOutline />} />
              <HeaderItem href={'/products/create'} text={'Hinzufügen'} icon={<IoAddOutline />} />
              <HeaderItem href={'/products/import'} text={'Importieren'} icon={<IoCloudUploadOutline />} />
            </HeaderItem>
          )}
          {(role == 'admin' || role == 'superadmin') && (
            <HeaderItem text={'Schüler'} href={'/students'} icon={<IoChevronDownOutline />}>
              <HeaderItem href={'/students'} text={'Einsehen'} icon={<IoAlbumsOutline />} />
              <HeaderItem href={'/students/import'} text={'Importieren'} icon={<IoCloudUploadOutline />} />
            </HeaderItem>
          )}
          {role == 'superadmin' && (
            <HeaderItem text={'Benutzer'} href={'/users'} icon={<IoChevronDownOutline />}>
              <HeaderItem href={'/users'} text={'Einsehen'} icon={<IoAlbumsOutline />} />
              <HeaderItem href={'/users/create'} text={'Hinzufügen'} icon={<IoPersonAddOutline />} />
            </HeaderItem>
          )}
          {session && <HeaderItem text={'Abmelden'} action={handleSignOut} icon={<IoLogOutOutline />} />}
        </>
      )}
    </>
  );

  return (
    <>
      <div className={styles.topNav}>{nav}</div>
      <div className={styles.topNavMobile}>
        <HeaderItem text={'Menu'} menu={true} icon={<IoMenuOutline />}>
          {nav}
        </HeaderItem>
      </div>
    </>
  );
}
