import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { prisma } from '../../../prisma';
import { User } from '@prisma/client';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { useToasts } from 'react-toast-notifications';
import Link from 'next/link';

export async function getServerSideProps(_context: any) {
  const users = await prisma.user.findMany();
  return { props: { users } };
}

export default function IndexUsersPage({ init_users }: { init_users: User[] }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [users, setUsers] = useState(init_users);
  const { addToast } = useToasts();

  // Fetch users from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/users');
      if (res.status === 200) {
        const json = await res.json();
        setUsers(json.data);
      } else {
        addToast('Ein Fehler ist aufgeregteren', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    };
    fetchData();
  }, [addToast, session]);

  const handleDelete = async (uuid: string) => {
    const res = await fetch(`/api/users/${uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 200) {
      const newContent = users.filter((user) => user.uuid !== uuid);
      setUsers(newContent);
      addToast('Benutzer erfolgreich gelöscht', {
        appearance: 'success',
        autoDismiss: true
      });
    } else if (res.status === 403) {
      addToast('Fehlende Berechtigung', {
        appearance: 'error',
        autoDismiss: true
      });
    } else if (res.status === 404) {
      addToast('Benutzer nicht gefunden', {
        appearance: 'error',
        autoDismiss: true
      });
    } else {
      addToast('Ein Fehler ist aufgeregteren', {
        appearance: 'error',
        autoDismiss: true
      });
    }
  };

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  // If the user is not authenticated or does not have the correct role, display access denied message
  if (!session || session.userRole !== 'superadmin') {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={'form table-form'}>
        <h1 className={'formHeading'}>Benutzer</h1>
        <div className={'tableWrapper'}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Rolle</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map((user) => (
                  <tr key={user.uuid}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.role === 'superadmin'
                        ? 'Super-Admin'
                        : user.role === 'admin'
                        ? 'Admin'
                        : user.role === 'seller'
                        ? 'Verkäufer'
                        : user.role}
                    </td>
                    <td>
                      <Link href={'users/' + user.uuid}>
                        <a className={'editButton'}>
                          <IoCreateOutline />
                        </a>
                      </Link>
                    </td>
                    <td>
                      <button className={'deleteButton'} onClick={() => handleDelete(user.uuid)}>
                        <IoTrashOutline />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
