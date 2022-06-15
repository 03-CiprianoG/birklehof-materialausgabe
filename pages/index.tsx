import Layout from "../components/layout"
import styles from "./styles/index.module.css"
import schulmaterial from "../assets/schulmaterial.png"
import Image from "next/image"

export default function IndexPage() {
  return (
    <Layout>
      <h1 className={styles.h1}>Willkommen in der Materialausgabe des Birklehof</h1>
      <div className={styles.image}>
        <Image layout="intrinsic" src={schulmaterial} alt="Schulmaterial" />
      </div>
    </Layout>
  )
}
