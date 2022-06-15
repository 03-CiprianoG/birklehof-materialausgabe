import {useState} from 'react'
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import prisma from "../api/prisma_client";
import { Sale } from "@prisma/client"
import { CSVLink } from "react-csv";

export async function getServerSideProps(_context: any) {
  let sales = await prisma.sale.findMany({
    include: {
      seller: true,
      itemsSold: {
        include: {
          product: true
        }
      },
    }
  })
  sales = JSON.parse(JSON.stringify(sales))
  return { props: { sales } }
}

export default function IndexSalesPage({ sales }: { sales: Sale[] }) {
  const { data: session, status } = useSession()
  const [data, setData] = useState([])
  const loading = status === "loading"
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const headers = [
    { label: "Seller", key: "seller" },
    { label: "Buyer", key: "buyer" },
    { label: "Items", key: "items" },
    { label: "Price", key: "price" },
    { label: "Sold at", key: "soldAt" },
  ];
  const csvReport = {
    data: data,
    headers: headers,
    filename: timestamp + '_sales_export.csv'
  };

  const generateCSV = (sales) => {
    console.log(sales)
    const data = sales.map((sale) => {
      const totalPrice = sale.itemsSold.reduce((acc, item) => {
        return acc + item.pricePerUnit * item.quantity
      }, 0);
      console.log(totalPrice)
      return {
        seller: sale.seller.name,
        buyer: sale.buyerName,
        items: sale.itemsSold.map((item) => {
          return `${item.product.name} x ${item.quantity}`
        }).join(", "),
        price: sale.itemsSold.map((item) => {
          return `${item.product.price}€ x ${item.quantity}`
        }).join(" + ") + " = " + totalPrice + "€",
        soldAt: sale.soldAt,
    }});
    console.log(data)
    setData(data)
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
      <h1>Export Sales</h1>
      <table>
        <thead>
        <tr>
          <th>Seller</th>
          <th>Buyer</th>
          <th>Items</th>
          <th>Price</th>
          <th>Sold at</th>
        </tr>
        </thead>
        <tbody>
        {data.map((sale) => (
          <tr key={sale.uuid}>
            <td>{sale.seller}</td>
            <td>{sale.buyer}</td>
            <td>{sale.items}</td>
            <td>{sale.price}</td>
            <td>{sale.soldAt}</td>
          </tr>
        ))}
        </tbody>
      </table>
      <br/>
      <div>
        <CSVLink {...csvReport}>Export to CSV</CSVLink>
        <button onClick={() => generateCSV(sales)}>Generate CSV</button>
      </div>
    </Layout>
  );
}
