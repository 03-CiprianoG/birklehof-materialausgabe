import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [products, setProducts] = useState()

  // Fetch products from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/products")
      if (res.status === 200) {
        const json = await res.json()
        setProducts(json.data)
      } else {
        console.log("An unknown error occurred")
      }
    }
    fetchData()
  }, [session])

  const handleDelete = async (uuid: string) => {
    const res = await fetch(`/api/products/${uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (res.status === 200) {
      const newContent = products.filter((product) => product.uuid !== uuid)
      setProducts(newContent)
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

  // If session exists, display products
  return (
    <Layout>
      <h1>Products</h1>
      <a href="products/create">Create</a>
      <table>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Name</th>
            <th>Price</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {products &&
            products.map((product) => (
              <tr key={product.uuid}>
                <td>{product.barcode}</td>
                <td>{product.name}</td>
                <td>{product.price} €</td>
                <td><a href={'products/' + product.uuid}>Edit</a></td>
                <td>
                  <button onClick={() => handleDelete(product.uuid)}>
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