import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { prisma } from '../../../prisma';
import type { Product } from '@prisma/client';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { useToasts } from 'react-toast-notifications';

export async function getServerSideProps(_context: any) {
  // Needs to use a custom query because the sort by prisma is case-sensitive
  const products = await prisma.$queryRaw`SELECT "public"."Product"."uuid", "public"."Product"."barcode", "public"."Product"."name", "public"."Product"."price" FROM "public"."Product" WHERE 1=1 ORDER BY LOWER("public"."Product"."name") ASC`;
  return { props: { products } };
}

export default function ProductsPage({ init_products }: { init_products: Product[] }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [products, setProducts] = useState(init_products);
  const { addToast } = useToasts();

  // Fetch products from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/products');
      if (res.status === 200) {
        const json = await res.json();
        setProducts(json.data);
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
    const res = await fetch(`/api/products/${uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 200) {
      const newContent = products.filter((product) => product.uuid !== uuid);
      setProducts(newContent);
      addToast('Produkt erfolgreich gelöscht', {
        appearance: 'success',
        autoDismiss: true
      });
    } else if (res.status === 403) {
      addToast('Fehlende Berechtigung', {
        appearance: 'error',
        autoDismiss: true
      });
    } else if (res.status === 404) {
      addToast('Produkt nicht gefunden', {
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
  if (
    !session ||
    (session.userRole !== 'seller' && session.userRole !== 'admin' && session.userRole !== 'superadmin')
  ) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  // If session exists, display products
  return (
    <Layout>
      <div className={'form table-form'}>
        <h1 className={'formHeading'}>Produkte</h1>
        <div className={'tableWrapper'}>
          <table>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Name</th>
                <th>Preis</th>
                {session.userRole !== 'admin' && session.userRole !== 'superadmin' ? null : (
                  <>
                    <th></th>
                    <th></th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {products &&
                products.map((product) => (
                  <tr key={product.uuid}>
                    <td>{product.barcode}</td>
                    <td>{product.name}</td>
                    <td>
                      {new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(product.price)}
                    </td>
                    {session.userRole !== 'admin' && session.userRole !== 'superadmin' ? null : (
                      <>
                        <td>
                          <a className={'editButton'} href={'products/' + product.uuid}>
                            <IoCreateOutline />
                          </a>
                        </td>
                        <td>
                          <button className={'deleteButton'} onClick={() => handleDelete(product.uuid)}>
                            <IoTrashOutline />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
