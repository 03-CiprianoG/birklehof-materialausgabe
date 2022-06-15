import React, {useState} from 'react'
import Layout from '../../components/layout'
import Router from 'next/router'
import {useSession} from "next-auth/react";
import AccessDenied from "../../components/access-denied";

export default function createSalePage() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [lastName, setLastName] = useState('')
  const [grade, setGrade] = useState('')

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { firstName, lastName, grade }
      const res = await fetch(`/api/students/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 200) {
        await Router.push('/students')
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
      <Layout title='Schüler'>
        <AccessDenied />
      </Layout>
    )
  }

  return (
    <Layout title='Schüler'>
      <div>
        <h1>Create Student</h1>
        <form onSubmit={submitData}>
          <input
            autoFocus
            onChange={e => setFirstName(e.target.value)}
            placeholder="First name"
            type="text"
            value={firstName}
            required
          />
          <input
            autoFocus
            onChange={e => setSecondName(e.target.value)}
            placeholder="Second name(s)"
            type="text"
            value={secondName}
            required
          />
          <input
            onChange={e => setLastName(e.target.value)}
            placeholder="Last name"
            type="text"
            value={lastName}
            required
          />
          <input
            onChange={e => setGrade(e.target.value)}
            placeholder="Grade"
            type="text"
            value={grade}
            required
          />
          <input
            disabled={!firstName || !lastName || !grade}
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