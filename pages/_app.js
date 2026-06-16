import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
        success: { iconTheme: { primary: '#0d9488', secondary: '#fff' } },
      }} />
    </>
  )
}
