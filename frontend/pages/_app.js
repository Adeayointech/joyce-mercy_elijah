import '../styles.css'
import Nav from '../components/Nav'
import ToastHost from '../components/Toast'

export default function App({ Component, pageProps }){
  return (
    <div>
      <Nav />
      <ToastHost />
      <main className="container">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
