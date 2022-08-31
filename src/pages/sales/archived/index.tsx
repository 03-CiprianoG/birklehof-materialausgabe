import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/layout';
import AccessDenied from '../../../components/accessDenied';
import { prisma } from '../../../../prisma';
import type { Item, Product, Sale, User } from '@prisma/client';
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
      archived: true
    },
    include: {
      seller: true,
      itemsSold: true
    },
    orderBy: [{ soldAt: 'desc' }, { archivedAt: 'desc' }]
  });
  sales = JSON.parse(JSON.stringify(sales));
  return { props: { sales } };
}

export default function IndexArchivedSalesPage({ init_sales }: { init_sales: SaleExtended[] }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [sales, setSales] = useState(init_sales);
  const { addToast } = useToasts();

  // Fetch archived sales from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/sales/archived');
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
  }, [addToast, session]);

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
      <div className={'form table-form'}>
        <h1 className={'formHeading'}>Archivierte Verkäufe</h1>
        <div className={'tableWrapper'}>
          <table>
            <thead>
              <tr>
                <th>Verkäufer</th>
                <th>Käufer</th>
                <th>Items</th>
                <th>Einzelpreise</th>
                <th>Gesamtpreis</th>
                <th>Verkauft am</th>
                <th>Archiviert am</th>
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
                      {new Date(sale.soldAt.toString()).toLocaleDateString('de-DE') +
                        ' ' +
                        new Date(sale.soldAt.toString()).toLocaleTimeString('de-DE')}
                    </td>
                    <td>
                      {sale.archivedAt &&
                        new Date(sale.archivedAt.toString()).toLocaleDateString('de-DE') +
                          ' ' +
                          new Date(sale.archivedAt.toString()).toLocaleTimeString('de-DE')}
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
