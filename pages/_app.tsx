import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import Head from "next/head";
import "./styles.css"
import "react-csv";
import { ToastProvider } from 'react-toast-notifications';

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Materialausgabe</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="shortcut icon" sizes="180x180" href="https://www.birklehof.de/wp-content/themes/birklehof-v2/favicon/apple-touch-icon.png"/>
      </Head>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </SessionProvider>
    </>
  )
}
