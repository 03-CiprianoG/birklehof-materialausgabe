import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { CSVLink } from 'react-csv';
import { useToasts } from 'react-toast-notifications';
import { Item, Sale, User } from '@prisma/client';

interface CustomSale extends Sale {
  seller: User;
  itemsSold: Item[];
}

interface CSVSale {
  uuid: string;
  seller: string;
  buyer: string;
  items: string;
  price: string;
  totalPrice: string;
  soldAt: string;
}

export default function IndexSalesPage() {
  const { data: session, status } = useSession();
  const [data, setData]: any = useState();
  const loading = status === 'loading';
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const headers = [
    { label: 'Verkäufer', key: 'seller' },
    { label: 'Käufer', key: 'buyer' },
    { label: 'Produkte', key: 'items' },
    { label: 'Einzelpreise', key: 'price' },
    { label: 'Gesamtpreis', key: 'totalPrice' },
    { label: 'Verkauft am', key: 'soldAt' }
  ];
  const csvReport = {
    data: data,
    headers: headers,
    filename: 'birklehof-materialausgabe_sales_export_' + timestamp.toString() + '.csv'
  };
  const { addToast } = useToasts();

  const handleArchiveAndExport = async () => {
    const res = await fetch('/api/sales/archive/all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 200) {
      const json = await res.json();
      await generateCSV(json.data);
    } else if (res.status === 400) {
      const json = await res.json();
      if (json.message) {
        addToast(json.message, {
          appearance: 'error',
          autoDismiss: true
        });
      } else {
        addToast('Ein Fehler ist aufgeregteren', {
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

  const generateCSV = async (sales: CustomSale[]) => {
    const data = sales.map((sale: CustomSale) => {
      const totalPrice = sale.itemsSold.reduce((acc, item) => {
        return acc + item.pricePerUnit * item.quantity;
      }, 0);
      return {
        uuid: sale.uuid,
        seller: sale.seller.name,
        buyer: sale.buyerName,
        items: sale.itemsSold
          .map((item) => {
            return `${item.productName} x ${item.quantity}`;
          })
          .join('; '),
        price: sale.itemsSold
          .map((item) => {
            return `${new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR'
            }).format(item.pricePerUnit)} € x ${item.quantity}`;
          })
          .join('; '),
        totalPrice: new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR'
        }).format(totalPrice),
        soldAt:
          new Date(sale.soldAt).toLocaleDateString('de-DE') + ', ' + new Date(sale.soldAt).toLocaleTimeString('de-DE')
      };
    });
    await setData(data);

    if (sales.length > 0) {
      // Click the download button to download the CSV file
      document.getElementById('download-csv')?.click();

      if (sales.length == 1) {
        addToast(`${sales.length} Kauf archiviert und als CSV-Datei heruntergeladen`, {
          appearance: 'success',
          autoDismiss: true
        });
      } else {
        addToast(`${sales.length} Käufe archiviert und als CSV-Datei heruntergeladen`, {
          appearance: 'success',
          autoDismiss: true
        });
      }
    } else {
      addToast('Kein unarchivierten Käufe', {
        appearance: 'info',
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
      <div className={'form'}>
        <h1 className={'formHeading'}>Verkäufe archivieren und exportieren</h1>
        {data?.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Verkäufer</th>
                <th>Käufer</th>
                <th>Produkte</th>
                <th>Einzelpreise</th>
                <th>Gesamtpreis</th>
                <th>Verkauft am</th>
              </tr>
            </thead>
            <tbody>
              {data.map((sale: CSVSale) => (
                <tr key={sale.uuid}>
                  <td>{sale.seller}</td>
                  <td>{sale.buyer}</td>
                  <td>{sale.items}</td>
                  <td>{sale.price}</td>
                  <td>{sale.totalPrice}</td>
                  <td>{sale.soldAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div>
          <form>
            <input
              type={'button'}
              onClick={handleArchiveAndExport}
              value={'Archivieren und exportieren'}
              style={{ marginTop: '15px' }}
            />
            {data?.length > 0 ? (
              <CSVLink id={'download-csv'} {...csvReport}>
                Erneut herunterladen
              </CSVLink>
            ) : null}
          </form>
        </div>
      </div>
    </Layout>
  );
}
