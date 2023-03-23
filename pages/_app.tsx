import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import 'react-tooltip/dist/react-tooltip.css'

import type { AppProps } from 'next/app'

const inter = Inter({ subsets: ['latin'] })

export default function App ({ Component, pageProps }: AppProps) {
  return <main className={inter.className}>
    <Component {...pageProps} />
  </main>
}
