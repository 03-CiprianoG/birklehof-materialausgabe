import React, { useState } from 'react';
import Layout from '../../components/layout';
import Router from 'next/router';
import AccessDenied from '../../components/accessDenied';
import { useSession } from 'next-auth/react';
import chooseFileStyle from '../../styles/chooseFile.module.css';
import { useToasts } from 'react-toast-notifications';
import { IoDocumentAttachOutline } from 'react-icons/io5';

export default function ImportStudentsPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [file, setFile]: any = useState();
  const [_createObjectURL, setCreateObjectURL] = useState('');
  const { addToast } = useToasts();

  const uploadToClient = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      // Check if file is a CSV file
      if (i.name.split('.').at(-1) !== 'csv') {
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
    if (file) {
      body.append('file', file);
    } else {
      addToast('Bitte lade eine CSV-Datei hoch', {
        appearance: 'warning',
        autoDismiss: true
      });
      return;
    }
    const res = await fetch('/api/students/import', {
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
      if (json.error) {
        addToast(json.error, {
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
      <div className={'form'}>
        <h1 className={'formHeading'}>Schüler importieren</h1>
        <div>
          {file && <p className={chooseFileStyle.chosenFileText}>{file.name}</p>}
          <label htmlFor="filePicker" className={chooseFileStyle.chooseFileButton}>
            <IoDocumentAttachOutline /> Datei auswählen
          </label>
          <input disabled={!file} type="submit" value={'Importieren'} onClick={uploadToServer} />
        </div>
        <input id="filePicker" hidden={true} type="file" name="docsUpload" onChange={uploadToClient} />
      </div>
    </Layout>
  );
}
