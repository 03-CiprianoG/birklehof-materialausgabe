import Link from "next/link"
import styles from "./footer.module.css"
import packageJSON from "../package.json"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.navItems}>
        <li className={styles.navItem}>
          <em>{packageJSON.name}@{packageJSON.version}</em>
        </li>
      </ul>
    </footer>
  )
}
