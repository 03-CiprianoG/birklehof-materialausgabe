import React, {useState} from 'react'
import Layout from '../../components/layout'
import Router from 'next/router'
import {useSession} from "next-auth/react";
import AccessDenied from "../../components/access-denied";
import Html5QrcodePlugin from "../../Html5QrcodePlugin/Html5QrcodePlugin.jsx";
import prisma from "../api/prisma_client";
import {Student} from "@prisma/client";
import { useToasts } from 'react-toast-notifications'

interface Item {
  barcode: string
  name: string
  quantity: number
  price: number
}

export async function getServerSideProps(_context: any) {
  const students = await prisma.student.findMany()
  return { props: { students } }
}

export default function createSalePage({ students }: { students: Student[] }) {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [itemsSold, setItemsSold] = useState<Item[]>([])
  const [newBarCode, setNewBarCode] = useState('')
  const [newQuantity, setNewQuantity] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const { addToast } = useToasts()

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
        addToast('Kauf erfolgreich erstellt', {
          appearance: 'success',
          autoDismiss: true,
        })
        setItemsSold([])
        setBuyerName('')
        setNewBarCode('')
        setNewQuantity('')
      } else if (res.status === 400) {
        const json = await res.json()
        if (json.message) {
          addToast(json.message, {
            appearance: 'error',
            autoDismiss: true,
          })
        } else {
          addToast('Ein Fehler ist aufgeregteren', {
            appearance: 'error',
            autoDismiss: true,
          })
        }
      } else {
        addToast('Ein Fehler ist aufgeregteren', {
          appearance: 'error',
          autoDismiss: true,
        })
      }
    } catch (error) {
      addToast('Ein Fehler ist aufgeregteren', {
        appearance: 'error',
        autoDismiss: true,
      })
    }
  }

  const addToItemsSold = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    // If the item is already in the list, increase the quantity else add it to the list
    const itemIndex = itemsSold.findIndex(item => {
      return item.barcode === newBarCode;
    })
    if (itemIndex !== -1) {
      const newItemsSold = [...itemsSold]
      newItemsSold[itemIndex].quantity = +newItemsSold[itemIndex].quantity + +newQuantity
      setItemsSold(newItemsSold)
      addToast(`Produkt ${newItemsSold[itemIndex].name} ${newQuantity} mal hinzugefügt`, {
        appearance: 'success',
        autoDismiss: true,
      })
    } else {
      try {
        const res = await fetch(`/api/products/barcode/${newBarCode}`)
        if (res.status === 200) {
          const json = await res.json()
          const newItem: Item = {
            barcode: newBarCode,
            name: json.data.name,
            quantity: +newQuantity,
            price: json.data.price
          }
          setItemsSold([...itemsSold, newItem])
          addToast(`Produkt ${json.data.name} ${newQuantity} mal hinzugefügt`, {
            appearance: 'success',
            autoDismiss: true,
          })
        } else if (res.status === 400) {
          const json = await res.json()
          if (json.message) {
            addToast(json.message, {
              appearance: 'error',
              autoDismiss: true,
            })
          } else {
            addToast('Ein Fehler ist aufgeregteren', {
              appearance: 'error',
              autoDismiss: true,
            })
          }
        } else if (res.status === 404) {
          addToast('Es gibt kein Produkt mit diesem Barcode', {
            appearance: 'error',
            autoDismiss: true,
          })
        } else {
          addToast('Ein Fehler ist aufgeregteren', {
            appearance: 'error',
            autoDismiss: true,
          })
        }
      } catch (error) {
        addToast('Ein Fehler ist aufgeregteren', {
          appearance: 'error',
          autoDismiss: true,
        })
      }
    }
  }

  const onNewScanResult = async (decodedText: string, _decodedResult: any) => {
    await setNewBarCode(decodedText)
  }
  
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout title='Verkaufen'>
        <AccessDenied />
      </Layout>
    )
  }

  return (
    <Layout title='Verkaufen'>
      <div className={'form-style-2'}>
        <h1 className={'form-style-2-heading'}>Produkt hinzufügen</h1>
        <Html5QrcodePlugin
          fps={10}
          qrbox={250}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}/>
        <br />
        <form onSubmit={addToItemsSold}>
          <label htmlFor="barcode"><span>Barcode <span className="required">*</span></span>
            <input
              name={'barcode'}
              className={'input-field'}
              autoFocus
              onChange={e => setNewBarCode(e.target.value)}
              type="text"
              value={newBarCode}
              required
            />
          </label>
          <label htmlFor="quantity"><span>Anzahl <span className="required">*</span></span>
            <input
              name={'quantity'}
              className={'input-field'}
              onChange={e => setNewQuantity(e.target.value)}
              type="number"
              step="1"
              min="1"
              value={newQuantity}
              required
            />
          </label>
          <label>
            <input type="submit" value="Hinzufügen"/>
          </label>
        </form>
      </div>
      <div className={'form-style-2'} style={{maxWidth: "unset"}}>
        <h1 className={'form-style-2-heading'}>Verkauf abschließen</h1>
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
                  onChange={e => setItemsSold([...itemsSold.slice(0, index), { ...item, quantity: +e.target.value }, ...itemsSold.slice(index + 1)])}
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
        <br/>
        <label htmlFor="total"><span>Gesamtpreis</span>
          <input
            className={'input-field'}
            name={'total'}
            type="text"
            value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(itemsSold.reduce((acc, item) => acc + item.quantity * item.price, 0))}
            required
            readOnly
          />
        </label>
        <form onSubmit={submitData}>
          <label htmlFor="buyer"><span>Käufer <span className="required">*</span></span>
            <input
              className={'input-field'}
              name={'buyer'}
              onChange={e => setBuyerName(e.target.value)}
              placeholder="Buyer Name"
              type="text"
              value={buyerName}
              required
              list="students"
            />
            <datalist id="students">
              {students.map(student => <option key={student.firstName + '-' + student.lastName + '-' + student.grade} value={student.firstName + ' ' + student.lastName + ', ' + student.grade} />)}
            </datalist>
          </label>
          <label>
            <input type="submit" value="Erstellen" disabled={!session.user?.email || !buyerName || !itemsSold || itemsSold.length === 0}/>
          </label>
          <label>
            <a className={'back'} href="#" onClick={() => Router.push('/')}>
              Abbrechen
            </a>
          </label>
        </form>
      </div>
    </Layout>
  )
}