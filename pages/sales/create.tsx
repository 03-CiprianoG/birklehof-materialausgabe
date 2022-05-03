import React, {useEffect, useState} from 'react'
import Layout from '../../components/layout'
import Router from 'next/router'
import {useSession} from "next-auth/react";
import AccessDenied from "../../components/access-denied";
import Html5QrcodePlugin from '../../src/Html5QrcodePlugin.jsx'

const createSale: React.FC = () => {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [itemsSold, setItemsSold] = useState([])
  const [newBarCode, setNewBarCode] = useState('')
  const [newQuantity, setNewQuantity] = useState('')

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { sellerEmail: session.user.email, itemsSold: itemsSold }
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

    try {
      const res = await fetch(`/api/products/barcode/${newBarCode}`)
      if (res.status === 200) {
        const json = await res.json()
        const newItemsSold = itemsSold.concat([{ barcode: newBarCode, name: json.data.name, quantity: newQuantity }])
        setItemsSold(newItemsSold)
      } else if (res.status === 404) {
        console.log("No product with that barcode")
      } else {
        console.log("An unknown error occurred")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onNewScanResult = async (decodedText, decodedResult) => {
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
            value={newQuantity}
            required
          />
          <button type="submit">Add Item</button>
        </form>
        <ul>
          {itemsSold.map((item, index) => (
            <li key={index}>
              {item.barcode} x {item.quantity}
            </li>
          ))}
        </ul>
        <form onSubmit={submitData}>
          <h1>Create Sale</h1>
          <input
            disabled={!session.user?.email || !itemsSold || itemsSold.length === 0}
            type="submit"
            value="Create"
          />
          <a className="back" href="#" onClick={() => Router.push('/sales')}>
            or Cancel
          </a>
        </form>
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 3rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        input[type='text'],
        input[type='number'] {
          width: 100%;
          padding: 0.5rem;
          margin: 0.5rem 0;
          border-radius: 0.25rem;
          border: 0.125rem solid rgba(0, 0, 0, 0.2);
        }
        input[type='submit'] {
          background: #ececec;
          border: 0;
          padding: 1rem 2rem;
        }
        .back {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  )
}

export default createSale;