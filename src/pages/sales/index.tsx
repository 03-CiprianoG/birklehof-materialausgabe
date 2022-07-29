import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import prisma from '../../../prismaClient';
import type { Item, Product, Sale, User } from '@prisma/client';
import { IoTrashOutline } from 'react-icons/io5';
import { useToasts } from 'react-toast-notifications';

interface SaleItem extends Item {
  product: Product;
}

interface SaleExtended extends Sale {
  seller: User;
  itemsSold: SaleItem[];
}

export async function getServerSideProps(_context: any) {
  let sales = await prisma.sale.findMany({
    where: {
      archived: false
    },
    include: {
      seller: true,
      itemsSold: true
    }
  });
  sales = JSON.parse(JSON.stringify(sales));
  return { props: { sales } };
}

export default function IndexSalesPage({ init_sales }: { init_sales: SaleExtended[] }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [sales, setSales] = useState(init_sales);
  const { addToast } = useToasts();

  // Fetch sales from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/sales');
      if (res.status === 200) {
        const json = await res.json();
        setSales(json.data);
      } else {
        addToast('Ein Fehler ist aufgeregteren', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    };
    fetchData();
  }, [session]);

  const handleDelete = async (uuid: string) => {
    const res = await fetch(`/api/sales/${uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 200) {
      const newContent = sales.filter((product) => product.uuid !== uuid);
      setSales(newContent);
      addToast('Kauf erfolgreich gelöscht', {
        appearance: 'success',
        autoDismiss: true
      });
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
    } else if (res.status === 403) {
      addToast('Fehlende Berechtigung', {
        appearance: 'error',
        autoDismiss: true
      });
    } else if (res.status === 404) {
      addToast('Kauf nicht gefunden', {
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
  if (!session || (session.userRole !== 'admin' && session.userRole !== 'superadmin')) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  // If session exists, display sales
  return (
    <Layout table={true}>
      <div className={'tableBox'}>
        <table>
          <thead>
            <tr>
              <th>Verkäufer</th>
              <th>Käufer</th>
              <th>Items</th>
              <th>Einzelpreise</th>
              <th>Gesamtpreis</th>
              <th>Verkauft am</th>
              <th>Löschen</th>
            </tr>
          </thead>
          <tbody>
            {sales &&
              sales.map((sale) => (
                <tr key={sale.uuid}>
                  <td>{sale.seller.name}</td>
                  <td>{sale.buyerName}</td>
                  <td>
                    <details>
                      <summary>{sale.itemsSold.length} Produkte</summary>
                      {sale.itemsSold.map((item) => (
                        <div key={item.uuid}>
                          <div>
                            {item.productName} x {item.quantity}
                          </div>
                        </div>
                      ))}
                    </details>
                  </td>
                  <td>
                    <details>
                      <summary>{sale.itemsSold.length} Produkte</summary>
                      {sale.itemsSold.map((item) => (
                        <div key={item.uuid}>
                          <div>
                            {new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(item.pricePerUnit)}
                            x {item.quantity} ={' '}
                            {new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(+item.quantity * +item.pricePerUnit)}
                          </div>
                        </div>
                      ))}
                    </details>
                  </td>
                  <td>
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(sale.itemsSold.reduce((acc, item) => acc + +item.quantity * +item.pricePerUnit, 0))}
                  </td>
                  <td>
                    {new Date(sale.soldAt).toLocaleDateString('de-DE')},{' '}
                    {new Date(sale.soldAt).toLocaleTimeString('de-DE')}
                  </td>
                  <td>
                    {/* Delete button */}
                    <button className={'deleteButton'} onClick={() => handleDelete(sale.uuid)}>
                      <IoTrashOutline />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
