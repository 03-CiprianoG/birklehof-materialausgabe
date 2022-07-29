import styles from './footer.module.css';
import packageJSON from '../../package.json';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <em className={styles.version}>
        {packageJSON.name}@{packageJSON.version}
      </em>
    </footer>
  );
}
