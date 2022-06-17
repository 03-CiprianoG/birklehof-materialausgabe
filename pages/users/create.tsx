import React, {useState} from 'react'
import Layout from '../../components/layout'
import Router from 'next/router'
import {useSession} from "next-auth/react";
import AccessDenied from "../../components/access-denied";
import Html5QrcodePlugin from "../../src/Html5QrcodePlugin.jsx";
import styles from '../styles/user.module.css'

export default function createSalePage() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { name: name, email: email, role: role }
      const res = await fetch(`/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 200) {
        Router.push('/users')
      } else {
        const json = await res.json()
        console.log(json.error)
      }
    } catch (error) {
      console.error(error)
    }
  }
  
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout title='Benutzer'>
        <AccessDenied />
      </Layout>
    )
  }

  return (
    <Layout title='Benutzer'>
      <div className={'form-style-2'} >
        <h1 className={'form-style-2-heading'}>Benutzer erstellen</h1>
        <form onSubmit={submitData}>
          <label htmlFor="name"><span>Name <span className="required">*</span></span>
            <input
              name={'name'}
              className={'input-field'}
              autoFocus
              onChange={e => setName(e.target.value)}
              type="text"
              value={name}
              required
            />
          </label>
          <label htmlFor="email"><span>E-Mail <span className="required">*</span></span>
            <input
              name={'email'}
              className={'input-field'}
              onChange={e => setEmail(e.target.value)}
              placeholder=""
              type="text"
              value={email}
              required
            />
          </label>
          <label htmlFor="role"><span>Rolle <span className="required">*</span></span>
            <select
              name={'role'}
              className="select-field"
              onChange={e => setRole(e.target.value)}
              value={role}
              required>
              <option value="admin">Admin</option>
              <option value="seller">Verkäufer</option>
            </select>
          </label>
          <label>
            <input type="submit" value="Erstellen" disabled={!name || !email || !role}/>
          </label>
          <label>
            <a className={'back'} href="#" onClick={() => Router.push('/users')}>
              Abbrechen
            </a>
          </label>
        </form>
      </div>
    </Layout>
  )
}