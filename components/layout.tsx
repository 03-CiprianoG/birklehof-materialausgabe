import Header from "./header"
import Footer from "./footer"
import styles from "./layout.module.css"

interface Props {
  children: React.ReactNode
  table?: boolean
}

// TODO: Use table attribute to display a table layout

export default function Layout({ children, table=false }: Props) {
  return (
    <>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </>
  )
}
