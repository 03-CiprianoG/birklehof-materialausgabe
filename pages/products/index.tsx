import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [content, setContent] = useState()

  // Fetch content from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/products")
      const json = await res.json()
      if (json.data) {
        setContent(json.data)
      } else {
        setContent(json.message)
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
      const newContent = content.filter((product) => product.uuid !== uuid)
      setContent(newContent)
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

  // If session exists, display content
  return (
    <Layout>
      <h1>Products</h1>
      <a href="products/create">Create</a>
      <ul>
        {content &&
          content.map((product) => (
            <li key={product.uuid}>
              <p>
                {product.name} <br />
                {product.barcode} <br />
                {product.price} €
              </p>
              <button onClick={() => handleDelete(product.uuid)}>
                Delete
              </button>
            </li>
          ))}
      </ul>
    </Layout>
  )
}
