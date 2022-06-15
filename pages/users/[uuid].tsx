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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  // fetch the user with the uuid
  useEffect(() => {
    if (uuid) {
      const fetchData = async () => {
        const res = await fetch(`/api/users/${uuid}`)
        if (res.status === 200) {
          const json = await res.json()
          setName(json.data.name)
          setEmail(json.data.email)
          setRole(json.data.role)
        } else {
          Router.push('/users')
        }
      }
      fetchData()
    }
  }, [uuid])

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { name: name, email: email, role: role }
      const res = await fetch(`/api/users/${uuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 200) {
        Router.push('/users')
      } else {
        console.log("An unknown error occurred")
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
      <div>
        <form onSubmit={submitData}>
          <h1>Update User</h1>
          <input
            autoFocus
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            type="text"
            value={name}
            required
          />
          <input
            onChange={e => setEmail(e.target.value)}
            placeholder="E-Mail"
            type="text"
            value={email}
            required
          />
          <select
            onChange={e => setRole(e.target.value)}
            value={role}
            required
          >
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
          </select>
          <input
            disabled={!name || !email || !role}
            type="submit"
            value="Update"
          />
          <a className="back" href="#" onClick={() => Router.push('/users')}>
            or Cancel
          </a>
        </form>
      </div>
    </Layout>
  )
}