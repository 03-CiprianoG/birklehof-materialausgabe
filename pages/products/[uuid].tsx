import React, {useEffect, useState} from 'react'
import Layout from '../../components/layout'
import Router from 'next/router'
import AccessDenied from "../../components/access-denied";
import {useSession} from "next-auth/react";
import Html5QrcodePlugin from "../../src/Html5QrcodePlugin";
import { useRouter } from 'next/router'

export default function createProductPage() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const router = useRouter();
  const {uuid} = router.query;
  const [barcode, setBarcode] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  // fetch the product with the id
  useEffect(() => {
    if (uuid) {
      const fetchData = async () => {
        const res = await fetch(`/api/products/${uuid}`)
        if (res.status === 200) {
          const json = await res.json()
          setBarcode(json.data.barcode)
          setName(json.data.name)
          setPrice(json.data.price)
        } else {
          Router.push('/products')
        }
      }
      fetchData()
    }
  }, [uuid])

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { barcode: barcode, name: name, price: price }
      const res = await fetch(`/api/products/${uuid}`, {
        method: 'PATCH',
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
    await setBarcode(decodedText)
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
      <div className={'form-style-2'}>
        <h1 className={'form-style-2-heading'}>Update product</h1>
        <Html5QrcodePlugin
          fps={10}
          qrbox={250}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}/>
        <br/>
        <form onSubmit={submitData}>
          <label htmlFor="barcode"><span>Barcode <span className="required">*</span></span>
            <input
              className={'input-field'}
              name={'barcode'}
              autoFocus
              onChange={e => setBarcode(e.target.value)}
              type="text"
              value={barcode}
              required
            />
          </label>
          <label htmlFor="name"><span>Name <span className="required">*</span></span>
            <input
              className={'input-field'}
              name={'name'}
              onChange={e => setName(e.target.value)}
              minLength={5}
              maxLength={255}
              type="text"
              value={name}
              required
            />
          </label>
          <label htmlFor="price"><span>Preis (in Euro) <span className="required">*</span></span>
            <input
              className={'input-field'}
              name={'price'}
              onChange={e => setPrice(e.target.value)}
              type="number"
              step="0.01"
              value={price}
              required
            />
          </label>
          <label>
            <input type="submit" value="Speichern" disabled={!name || !barcode || !price}/>
          </label>
          <label>
            <a className={'back'} href="#" onClick={() => Router.push('/products')}>
              Abbrechen
            </a>
          </label>
        </form>
      </div>
    </Layout>
  )
}