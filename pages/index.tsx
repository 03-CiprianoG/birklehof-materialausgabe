import Layout from "../components/layout"
import styles from "./styles/index.module.css"
import schulmaterial from "../assets/schulmaterial.png"
import Image from "next/image"
import { useToasts } from 'react-toast-notifications'

export default function IndexPage() {
  const { addToast } = useToasts()

  return (
    <Layout>
      <button onClick={() => addToast('Success', {
        appearance: 'success',
        autoDismiss: true,
      })}>
        Add Toast
      </button>
      <h1 className={styles.h1}>Willkommen in der Materialausgabe des Birklehof</h1>
      <div className={styles.image}>
        <Image layout="intrinsic" src={schulmaterial} alt="Schulmaterial" />
      </div>
    </Layout>
  )
}
