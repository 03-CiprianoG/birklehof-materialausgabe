import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"

export default function SalesPage() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [sales, setSales] = useState()
  const options = {
    weekday: "long", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
  };

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

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }

  // If session exists, display sales
  return (
    <Layout>
      <h1>Sales</h1>
      <a href="sales/create">Sell</a>
      <table>
        <thead>
          <tr>
            <th>Seller</th>
            <th>Items sold</th>
            <th>Total price</th>
            <th>Sold at</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales &&
            sales.map((sale) => (
              <tr key={sale.uuid}>
                <td>{sale.sellerEmail}</td>
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
                    <summary>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(sale.itemsSold.reduce((acc, item) => acc + +item.quantity * +item.product.price, 0))}</summary>
                    {sale.itemsSold.map((item) => (
                      <div key={item.uuid}>
                        <div>
                          {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(item.product.price)}
                          x {item.quantity} = {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(+item.quantity * +item.product.price)}
                        </div>
                      </div>
                    ))}
                  </details>
                </td>
                <td>{new Date(sale.soldAt).toLocaleTimeString('de-DE', options)}</td>
                <td>
                  <button onClick={() => handleDelete(sale.uuid)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  )
}
