import Header from "./header"
import Footer from "./footer"
import styles from "./layout.module.css"

interface Props {
  children: React.ReactNode
  title?: string
  table?: boolean
}

export default function Layout({ children, title, table=false }: Props) {
  return (
    <>
      <Header />
      {table ? (
        <table className={styles.table}>
          <thead>
          <tr>
            <th>a</th>
          </tr>
          </thead>
        </table>) : null}
      <div className={styles.sideLabelContainer}>
        <h1 className={styles.sideLabel}>{title != null ? title : 'Birklehof'}</h1>
      </div>
      <main className={styles.main}>
        <div className={styles.mainBox}>
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}
