import React, {useState} from 'react'
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import { CSVLink } from "react-csv";

export default function IndexSalesPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState([])
  const loading = status === "loading"
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const headers = [
    { label: 'Verkäufer', key: 'seller' },
    { label: 'Käufer', key: 'buyer' },
    { label: 'Produkte', key: 'items' },
    { label: 'Einzelpreise', key: 'price' },
    { label: 'Gesamtpreis', key: 'totalPrice' },
    { label: 'Verkauft am', key: 'soldAt' },
  ];
  const csvReport = {
    data: data,
    headers: headers,
    filename: timestamp + '_sales_export.csv'
  };

  const handleArchiveAndExport = async () => {
    const res = await fetch('/api/sales/archive/all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (res.status === 200) {
      const json = await res.json()
      await generateCSV(json.data)
    } else {
      console.log('An unknown error occurred')
    }
  }

  const generateCSV = async (sales) => {
    console.log(sales)
    const data = sales.map((sale) => {
      const totalPrice = sale.itemsSold.reduce((acc, item) => {
        return acc + item.pricePerUnit * item.quantity
      }, 0);
      return {
        uuid: sale.uuid,
        seller: sale.seller.name,
        buyer: sale.buyerName,
        items: sale.itemsSold.map((item) => {
          return `${item.productName} x ${item.quantity}`
        }).join("; "),
        price: sale.itemsSold.map((item) => {
          return `${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.pricePerUnit)} € x ${item.quantity}`
        }).join("; "),
        totalPrice: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalPrice),
        soldAt: new Date(sale.soldAt).toLocaleDateString('de-DE') + ', ' + new Date(sale.soldAt).toLocaleTimeString('de-DE')
    }});
    await setData(data)
    // Click the download button to download the CSV file
    if (sales.length > 0){
      document.getElementById('download-csv').click()
    } else {
      console.log('No sales to archive and export')
    }
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout title='Verkäufe'>
        <AccessDenied />
      </Layout>
    )
  }

  // If session exists, display users
  return (
    <Layout title='Verkäufe'>
      <div className={'form-style-2'}>
        <h1  className={'form-style-2-heading'}>Verkäufe archivieren und exportieren</h1>
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
          {data.map((sale) => (
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
        <br/>
        <div>
          <form>
            <label>
              <input type={'button'} onClick={handleArchiveAndExport} value={'Archivieren und exportieren'} />
            </label>
            {data.length > 0 ? (
              <label>
                <CSVLink id={'download-csv'} {...csvReport}>Erneut herunterladen</CSVLink>
              </label>
            ) : null}
          </form>
        </div>
      </div>
    </Layout>
  );
}
