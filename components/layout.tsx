import Header from "./header"
import Footer from "./footer"
import styles from "./layout.module.css"

interface Props {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title }: Props) {
  return (
    <>
      <Header />
      <div className={styles.sideLabelContainer}>
        <h1 className={styles.sideLabel}>{title != null ? title : 'Birklehof'}</h1>
      </div>
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  )
}
