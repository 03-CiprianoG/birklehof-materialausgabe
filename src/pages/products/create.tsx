import React, { useState } from 'react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { useSession } from 'next-auth/react';
import Html5QrcodePlugin from '../../plugins/Html5QrcodePlugin/Html5QrcodePlugin';
import { useToasts } from 'react-toast-notifications';
import Link from 'next/link';

export default function CreateProductPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const { addToast } = useToasts();

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const body = { barcode: barcode, name: name, price: price };
      const res = await fetch(`/api/products/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.status === 200) {
        addToast('Produkt erfolgreich erstellt', {
          appearance: 'success',
          autoDismiss: true
        });
        setName('');
        setPrice('');
        setBarcode('');
        document.getElementById('barcode')?.focus();
      } else if (res.status === 400) {
        const json = await res.json();
        if (json.error) {
          addToast(json.error, {
            appearance: 'error',
            autoDismiss: true
          });
        } else {
          addToast('Ein Fehler ist aufgeregteren', {
            appearance: 'error',
            autoDismiss: true
          });
        }
      } else if (res.status === 403) {
        addToast('Fehlende Berechtigung', {
          appearance: 'error',
          autoDismiss: true
        });
      } else {
        addToast('Ein Fehler ist aufgeregteren', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    } catch (error) {
      addToast('Ein Fehler ist aufgeregteren', {
        appearance: 'error',
        autoDismiss: true
      });
    }
  };

  const onNewScanResult = async (decodedText: string, _decodedResult: any) => {
    await setBarcode(decodedText);
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
        <h1 className={'formHeading'}>Produkt erstellen</h1>
        <Html5QrcodePlugin fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={onNewScanResult} />
        <br />
        <form onSubmit={submitData}>
          <label htmlFor="barcode">
            <span>
              Barcode <span className="required">*</span>
            </span>
            <input
              className={'input-field'}
              name={'barcode'}
              id={'barcode'}
              autoFocus
              onChange={(e) => setBarcode(e.target.value)}
              type="text"
              value={barcode}
              required
            />
          </label>
          <label htmlFor="name">
            <span>
              Name <span className="required">*</span>
            </span>
            <input
              className={'input-field'}
              name={'name'}
              onChange={(e) => setName(e.target.value)}
              minLength={5}
              maxLength={255}
              type="text"
              value={name}
              required
            />
          </label>
          <label htmlFor="price">
            <span>
              Preis (in Euro) <span className="required">*</span>
            </span>
            <input
              className={'input-field'}
              name={'price'}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              step="0.01"
              value={price}
              required
            />
          </label>
          <input type="submit" value="Hinzufügen" disabled={!name || !barcode || !price} />
          <Link href={'/products'}>
            <a className={'back'}>Abbrechen</a>
          </Link>
        </form>
      </div>
    </Layout>
  );
}
