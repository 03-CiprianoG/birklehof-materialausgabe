import React, { useState } from "react";
import Layout from "../../components/layout";
import Router from 'next/router'

export default function ImportStudentsPage() {
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

  return (
    <Layout>
      <div>
        <h1>Import Students</h1>
        <div>
          <h4>Select Image</h4>
          <input type="file" name="docsUpload" onChange={uploadToClient} />
          <button
            className="btn btn-primary"
            type="submit"
            onClick={uploadToServer}
          >
            Send to server
          </button>
        </div>
      </div>
    </Layout>
  );
}