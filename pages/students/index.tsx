import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import prisma from "../api/prisma_client";
import type { Student } from '@prisma/client'

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

  const handleDelete = async (uuid: string) => {
    const res = await fetch(`/api/students/${uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (res.status === 200) {
      const newContent = students.filter((student) => student.uuid !== uuid)
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
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }

  // If session exists, display students
  return (
    <Layout>
      <h1>Students</h1>
      <a href="students/create">Create a student</a>
      <a href="students/import">Import students</a>
      <table>
        <thead>
          <tr>
            <th>First name</th>
            <th>Second name(s)</th>
            <th>Last name</th>
            <th>Grade</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {students &&
            students.map((student) => (
              <tr key={student.uuid}>
                <td>{student.firstName}</td>
                <td>{student.secondName}</td>
                <td>{student.lastName}</td>
                <td>{student.grade}</td>
                <td>
                  <button onClick={() => handleDelete(student.uuid)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  )
}
