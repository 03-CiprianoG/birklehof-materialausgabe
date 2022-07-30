import Layout from '../../components/layout';
import styles from '../../styles/signin.module.css';
import { getProviders, signIn, useSession } from 'next-auth/react';
import { IoLogoGoogle, IoLogoApple, IoLogoGithub } from 'react-icons/io5';

export default function SignIn({ providers }) {
  const { data: session } = useSession();
  if (session) {
    document.location.href = '/';
  }

  return (
    <Layout>
      <div className={styles.form}>
        <h1 className={styles.formHeading}>Anmelden</h1>
        {Object.values(providers).map((provider) => (
          <div key={provider.name}>
            <button className={styles.button} onClick={() => signIn(provider.id)}>
              <>
                {provider.name === 'Google' && <IoLogoGoogle />}
                {provider.name === 'Apple' && <IoLogoApple />}
                {provider.name === 'GitHub' && <IoLogoGithub />}
              </>{' '}
              Sign in with {provider.name}
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers }
  };
}
