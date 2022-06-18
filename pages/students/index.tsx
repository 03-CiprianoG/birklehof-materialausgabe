import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import prisma from "../api/prisma_client";
import type { Student } from '@prisma/client'
import { IoTrashOutline } from "react-icons/io5";
import {useToasts} from "react-toast-notifications";

export async function getServerSideProps(_context: any) {
  const students = await prisma.student.findMany()
  return { props: { students } }
}

export default function IndexSalesPage({ init_students }: { init_students: Student[] }) {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [students, setStudents] = useState(init_students)
  const { addToast } = useToasts()
  
  // Fetch sales from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/students")
      if (res.status === 200) {
        const json = await res.json()
        setStudents(json.data)
      } else {
        addToast('Ein Fehler ist aufgeregteren', {
          appearance: 'error',
          autoDismiss: true,
        })
      }
    }
    fetchData()
  }, [session])

  const handleDelete = async (number: string) => {
    const res = await fetch(`/api/students/${number}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (res.status === 200) {
      const newContent = students.filter((student) => student.number !== number)
      setStudents(newContent)
      addToast('Schüler erfolgreich gelöscht', {
        appearance: 'success',
        autoDismiss: true,
      })
    } else if (res.status === 403) {
      addToast('Fehlende Berechtigung', {
        appearance: 'error',
        autoDismiss: true,
      })
    }  else if (res.status === 404) {
      addToast('Schüler nicht gefunden', {
        appearance: 'error',
        autoDismiss: true,
      })
    }  else {
      addToast('Ein Fehler ist aufgeregteren', {
        appearance: 'error',
        autoDismiss: true,
      })
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

  // If session exists, display students
  return (
    <Layout title='Schüler' table={true}>
      <div className={'tableBox'}>
        <table>
          <thead>
          <tr>
            <th>Schülernummer</th>
            <th>Nachname</th>
            <th>Vorname</th>
            <th>Vorname 2</th>
            <th>Namenszusatz</th>
            <th>Klasse</th>
            <th>Löschen</th>
          </tr>
          </thead>
          <tbody>
          {students &&
            students.map((student) => (
              <tr key={student.number}>
                <td>{student.number}</td>
                <td>{student.lastName}</td>
                <td>{student.firstName}</td>
                <td>{student.secondName}</td>
                <td>{student.nameAlias}</td>
                <td>{student.grade}</td>
                <td>
                  <button className={'deleteButton'} onClick={() => handleDelete(student.number)}>
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
