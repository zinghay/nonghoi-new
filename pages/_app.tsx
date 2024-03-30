import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '../pages/Header.js'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
