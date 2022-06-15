import React, { useState } from "react";
import Layout from "../../components/layout";
import Router from 'next/router'
import AccessDenied from "../../components/access-denied";
import {useSession} from "next-auth/react";
import styles from "../styles/students.module.css";

export default function ImportStudentsPage() {
  const { data: session, status } = useSession()
  const [file, setFile] = useState();
  const [createObjectURL, setCreateObjectURL] = useState('');

  const uploadToClient = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      // Check if file is a CSV
      if (i.name.split(".")[1] !== "csv") {
        alert("Please upload a CSV file");
        return;
      }

      setFile(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (_event: any) => {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/students/import", {
      method: "POST",
      body
    });
    if (response.status === 200) {
      Router.push("/students");
    } else {
      console.log("An unknown error occurred");
    }
  };

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
        <h1>Schüler importieren</h1>
        <div>
          {file && <p>{file.name}</p>}
          <label htmlFor="filePicker" className={styles.chooseFileButton}>
            Datei auswählen
          </label>
          <button
            className={styles.importButton}
            type="submit"
            onClick={uploadToServer}
          >
            Importieren
          </button>
        </div>
        <input id="filePicker" hidden={true} type="file" name="docsUpload" onChange={uploadToClient}/>
      </div>
    </Layout>
  );
}