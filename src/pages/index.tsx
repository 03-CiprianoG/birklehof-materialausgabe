import React, { useEffect } from 'react';
import Router from 'next/router';
import { useSession } from 'next-auth/react';
import { useToasts } from 'react-toast-notifications';
import FullscreenLoadingSpinner from '../components/fullscreenLoadingSpinner';
import Layout from '../components/layout';

export default function IndexPage() {
  const { data: session } = useSession();
  const { addToast } = useToasts();

  const redirect = async () => {
    const res = await fetch('/api/auth/role');
    if (res.status === 200) {
      const role = await res.json();
      if (role === 'seller') {
        await Router.push('/sales/create');
      } else if (role === 'admin') {
        await Router.push('/sales');
      } else if (role === 'superadmin') {
        await Router.push('/users');
      } else {
        addToast('Fehler bei der Autentifizierung', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    } else {
      addToast('Fehler bei der Autentifizierung', {
        appearance: 'error',
        autoDismiss: true
      });
    }
  };

  useEffect(() => {
    if (session) {
      redirect();
    } else {
      Router.push('/auth/signin');
    }
  }, [session]);

  return (
    <Layout>
      <FullscreenLoadingSpinner />
    </Layout>
  );
}
