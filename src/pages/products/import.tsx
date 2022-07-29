import React, { useState } from 'react';
import Layout from '../../components/layout';
import Router from 'next/router';
import AccessDenied from '../../components/accessDenied';
import { useSession } from 'next-auth/react';
import styles from '../../styles/products.module.css';
import { useToasts } from 'react-toast-notifications';

export default function ImportStudentsPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [file, setFile] = useState();
  const [_createObjectURL, setCreateObjectURL] = useState('');
  const { addToast } = useToasts();

  const uploadToClient = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      // Check if file is a CSV
      if (i.name.split('.')[1] !== 'csv') {
        addToast('Bitte lade eine CSV-Datei hoch', {
          appearance: 'warning',
          autoDismiss: true
        });
        return;
      }

      setFile(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (_event: any) => {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/products/import', {
      method: 'POST',
      body
    });
    if (res.status === 200) {
      addToast('Datei erfolgreich hochgeladen', {
        appearance: 'success',
        autoDismiss: true
      });
      Router.push('/students');
    } else if (res.status === 400) {
      const json = await res.json();
      if (json.message) {
        addToast(json.message, {
          appearance: 'error',
          autoDismiss: true
        });
      } else {
        addToast('Datei ungültig', {
          appearance: 'error',
          autoDismiss: true
        });
      }
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
  if (!session || (session.userRole !== 'admin' && session.userRole !== 'superadmin')) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={'form-style-2'}>
        <h1 className={'form-style-2-heading'}>Produkte importieren</h1>
        <div>
          {file && <p>{file.name}</p>}
          <label htmlFor="filePicker" className={styles.chooseFileButton}>
            Datei auswählen
          </label>
          <input type="submit" onClick={uploadToServer} value={'Importieren'} />
        </div>
        <input id="filePicker" hidden={true} type="file" name="docsUpload" onChange={uploadToClient} />
      </div>
    </Layout>
  );
}
