import React, { useState } from 'react'
import Layout from '../../components/layout'
import Router from 'next/router'
import AccessDenied from "../../components/access-denied";
import {useSession} from "next-auth/react";
import Html5QrcodePlugin from "../../src/Html5QrcodePlugin";

export default function createProductPage() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [barcode, setBarcode] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { barcode: barcode, name: name, price: price }
      const res = await fetch(`/api/products/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 200) {
        Router.push('/products')
      } else {
        console.log("An unknown error occurred")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onNewScanResult = async (decodedText: string, _decodedResult: any) => {
    setBarcode(decodedText)
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout title='Produkte'>
        <AccessDenied />
      </Layout>
    )
  }

  return (
    <Layout title='Produkte'>
      <div>
        <Html5QrcodePlugin
          fps={10}
          qrbox={250}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}/>
        <form onSubmit={submitData}>
          <h1>Create Product</h1>
          <input
            autoFocus
            onChange={e => setBarcode(e.target.value)}
            placeholder="Bar Code"
            type="text"
            value={barcode}
          />
          <input
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            minLength={5}
            maxLength={255}
            type="text"
            value={name}
          />
          <input
            onChange={e => setPrice(e.target.value)}
            placeholder="Price (in euro)"
            type="number"
            step="0.01"
            value={price}
          />
          <input
            disabled={!name || !barcode || !price}
            type="submit"
            value="Create"
          />
          <a className="back" href="#" onClick={() => Router.push('/products')}>
            or Cancel
          </a>
        </form>
      </div>
    </Layout>
  )
}