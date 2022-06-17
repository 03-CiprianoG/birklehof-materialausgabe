import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import prisma from "../api/prisma_client";
import { User } from "@prisma/client"
import {IoTrashOutline} from "react-icons/io5";

export async function getServerSideProps(context: any) {
  const users = await prisma.user.findMany()
  return { props: { users } }
}

export default function IndexSalesPage({ init_users }: { init_users: User[] }) {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [users, setUsers] = useState(init_users)
  const options = {
    weekday: "long", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
  };
  
  // Fetch sales from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/users")
      if (res.status === 200) {
        const json = await res.json()
        setUsers(json.data)
      } else {
        console.log("An unknown error occurred")
      }
    }
    fetchData()
  }, [session])

  const handleDelete = async (uuid: string) => {
    const res = await fetch(`/api/users/${uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (res.status === 200) {
      const newContent = users.filter((user) => user.uuid !== uuid)
      setUsers(newContent)
    } else {
      console.log("An unknown error occurred")
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

  // If session exists, display users
  return (
    <Layout title='Benutzer'>
      <div className={'tableBox'}>
        <table>
          <thead>
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Bearbeiten</th>
            <th>Löschen</th>
          </tr>
          </thead>
          <tbody>
          {users &&
            users.map((user) => (
              <tr key={user.uuid}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td><a href={'users/' + user.uuid}>Bearbeiten</a></td>
                <td>
                  <button className={'deleteButton'} onClick={() => handleDelete(user.uuid)}>
                    <IoTrashOutline/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
