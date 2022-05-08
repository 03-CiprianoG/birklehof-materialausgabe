import React, {useState} from 'react'
import Layout from '../../components/layout'
import Router from 'next/router'
import {useSession} from "next-auth/react";
import AccessDenied from "../../components/access-denied";
import Html5QrcodePlugin from "../../src/Html5QrcodePlugin.jsx";

export default function createSalePage() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [itemsSold, setItemsSold] = useState([])
  const [newBarCode, setNewBarCode] = useState('')
  const [newQuantity, setNewQuantity] = useState('')
  const [buyerName, setBuyerName] = useState('')

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { sellerEmail: session?.user?.email, buyerName: buyerName, itemsSold: itemsSold }
      const res = await fetch(`/api/sales/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 200) {
        Router.push('/sales')
      } else {
        const json = await res.json()
        console.log(json.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const addToItemsSold = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    // If the item is already in the list, increase the quantity else add it to the list
    const itemIndex = itemsSold.findIndex(item => item.barcode === newBarCode)
    if (itemIndex !== -1) {
      const newItemsSold = [...itemsSold]
      newItemsSold[itemIndex].quantity = +newItemsSold[itemIndex].quantity + +newQuantity
      setItemsSold(newItemsSold)
    } else {
      try {
        const res = await fetch(`/api/products/barcode/${newBarCode}`)
        if (res.status === 200) {
          const json = await res.json()

          setItemsSold([...itemsSold, { barcode: newBarCode, name: json.data.name, quantity: newQuantity, price: json.data.price }])
        } else if (res.status === 404) {
          console.log("No product with that barcode")
        } else {
          console.log("An unknown error occurred")
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const onNewScanResult = async (decodedText, _decodedResult) => {
    setNewBarCode(decodedText)
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

  return (
    <Layout>
      <div>
        <h1>Create Sale</h1>
        <Html5QrcodePlugin
          fps={10}
          qrbox={250}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}/>
        <form onSubmit={addToItemsSold}>
          <input
            autoFocus
            onChange={e => setNewBarCode(e.target.value)}
            placeholder="Bar Code"
            type="text"
            value={newBarCode}
            required
          />
          <input
            autoFocus
            onChange={e => setNewQuantity(e.target.value)}
            placeholder="Quantity"
            type="number"
            step="1"
            min="1"
            value={newQuantity}
            required
          />
          <button type="submit">Add Item</button>
        </form>
        <table>
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {itemsSold.map((item, index) => (
              <tr key={index}>
                <td>{item.barcode}</td>
                <td>{item.name}</td>
                <td>
                  <input
                    onChange={e => setItemsSold([...itemsSold.slice(0, index), { ...item, quantity: e.target.value }, ...itemsSold.slice(index + 1)])}
                    type="number"
                    step="1"
                    min="1"
                    value={item.quantity}
                    required
                  />
                </td>
                <td>{new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(item.price)}</td>
                <td>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(+item.quantity * +item.price)}</td>
                <td><button onClick={() => setItemsSold(itemsSold.filter((_, i) => i !== index))}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Total</p>
        <p>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(itemsSold.reduce((acc, item) => acc + item.quantity * item.price, 0))}</p>
        <form onSubmit={submitData}>
          <input
            onChange={e => setBuyerName(e.target.value)}
            placeholder="Buyer Name"
            type="text"
            value={buyerName}
            required
          />
          <input
            disabled={!session.user?.email || !buyerName || !itemsSold || itemsSold.length === 0}
            type="submit"
            value="Create"
          />
          <a className="back" href="#" onClick={() => Router.push('/sales')}>
            or Cancel
          </a>
        </form>
      </div>
    </Layout>
  )
}