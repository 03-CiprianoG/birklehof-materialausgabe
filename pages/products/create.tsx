import React, { useState } from 'react'
import Layout from '../../components/layout'
import Router from 'next/router'

const Draft: React.FC = () => {
  const [barcode, setBarcode] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { barcode: barcode, name: name, price: price }
      await fetch(`/api/products/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      await Router.push('/products')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Layout>
      <div>
        <form
          onSubmit={submitData}>
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

export default Draft;