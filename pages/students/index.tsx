import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import prisma from "../api/prisma_client";
import type { Student } from '@prisma/client'
import { IoTrashOutline } from "react-icons/io5";

export async function getServerSideProps(context: any) {
  const students = await prisma.student.findMany()
  return { props: { students } }
}

export default function IndexSalesPage({ init_students }: { init_students: Student[] }) {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [students, setStudents] = useState(init_students)
  const options = {
    weekday: "long", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
  };
  
  // Fetch sales from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/students")
      if (res.status === 200) {
        const json = await res.json()
        setStudents(json.data)
      } else {
        console.log("An unknown error occurred")
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
    } else {
      console.log("An unknown error occurred")
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
    <Layout title='Schüler'>
      <div className={'tableToolbar'}>
        <a className={'tableToolbarItem'} href="students/import">
          Schüler importieren
        </a>
        <a className={'tableToolbarItem'} href="students/import">
          Tabelle leeren
        </a>
      </div>
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
