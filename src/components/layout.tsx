import Header from './header';
import Main from './main';
import styles from './layout.module.css';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className={styles.layout}>
      <Header />
      <Main>{children}</Main>
    </div>
  );
}
