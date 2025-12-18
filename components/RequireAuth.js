import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function RequireAuth({ children, role }){
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(()=>{
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if(!token || !raw){ router.push('/login'); return }
    try{
      const user = JSON.parse(raw)
      if(role && user.role !== role){ router.push('/'); return }
      setReady(true)
    }catch(e){ router.push('/login') }
  }, [])

  if(!ready) return null
  return children
}
