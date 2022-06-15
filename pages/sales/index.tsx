import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import prisma from "../api/prisma_client";
import type { Sale, User, Item, Product } from "@prisma/client"

interface SaleItem extends Item {
  product: Product
}

interface SaleExtended extends Sale {
  seller: User
  itemsSold: SaleItem[]
}

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

export default function IndexSalesPage({ init_sales }: { init_sales: SaleExtended[] }) {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [showArchived, setShowArchived] = useState(false)
  const [sales, setSales] = useState(init_sales)

  // Fetch sales from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/sales")
      if (res.status === 200) {
        const json = await res.json()
        setSales(json.data)
      } else {
        console.log("An unknown error occurred")
      }
    }
    fetchData()
  }, [session])

  const handleDelete = async (uuid: string) => {
    const res = await fetch(`/api/sales/${uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (res.status === 200) {
      const newContent = sales.filter((product) => product.uuid !== uuid)
      setSales(newContent)
    } else {
      console.log("An unknown error occurred")
    }
  }
  const handleArchive = async (uuid: string) => {
    const res = await fetch(`/api/sales/archive/${uuid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      }
    })
    if (res.status === 200) {
      const newContent = sales.map((sale) => {
        if (sale.uuid === uuid) {
          sale.archived = true
        }
        return sale
      });
      console.log(newContent)
      setSales(newContent)
    } else {
      console.log("An unknown error occurred")
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

  // If session exists, display sales
  return (
    <Layout title='Verkäufe'>
      <h1>Sales</h1>
      
      <a href="sales/create">Sell</a><a href="sales/export">Export Sales To CSV</a>
      <br/>
      <input
        type="checkbox"
        checked={showArchived}
        onChange={() => setShowArchived(!showArchived)}
      />
      <label>Show archived sales</label>
      <table>
        <thead>
          <tr>
            <th>Seller</th>
            <th>Buyer</th>
            <th>Items</th>
            <th>Total price</th>
            <th>Sold at</th>
            {showArchived ? <th>Archived at</th> : null}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales &&
            sales.filter((sale) => showArchived || !sale.archived).map((sale) => (
              <tr key={sale.uuid}>
                <td>{sale.seller.email}</td>
                <td>{sale.buyerName}</td>
                <td>
                  <details>
                    <summary>{sale.itemsSold.length} items</summary>
                    {sale.itemsSold.map((item) => (
                      <div key={item.uuid}>
                        <div>
                          {item.product.name} x {item.quantity}
                        </div>
                      </div>
                    ))}
                  </details>
                </td>
                <td>
                  <details>
                    <summary>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(sale.itemsSold.reduce((acc, item) => acc + +item.quantity * +item.pricePerUnit, 0))}</summary>
                    {sale.itemsSold.map((item) => (
                      <div key={item.uuid}>
                        <div>
                          {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(item.pricePerUnit)}
                          x {item.quantity} = {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(+item.quantity * +item.pricePerUnit)}
                        </div>
                      </div>
                    ))}
                  </details>
                </td>
                <td>{new Date(sale.soldAt).toLocaleTimeString('de-DE')}</td>
                {showArchived ? (sale.archived ? (sale.archivedAt ? <td>{new Date(sale.archivedAt).toLocaleTimeString('de-DE')}</td> : <td>Not yet loaded</td>) : <td>Not archived</td>) : null}
                <td>
                  {!sale.archived ? <div>
                    {/* Delete button */}
                    <button onClick={() => handleDelete(sale.uuid)}>
                      Delete
                    </button>
                    {/* Archive button */}
                    <button onClick={() => handleArchive(sale.uuid)}>
                      Archive
                    </button>
                  </div> : null}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  )
}
