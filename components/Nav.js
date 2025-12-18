import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'

export default function Nav(){
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const pollRef = useRef(null)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('user')
      if(raw) setUser(JSON.parse(raw))
    }catch(e){ setUser(null) }
  }, [])

  // react to storage changes and route changes (login/logout from other tabs or after actions)
  useEffect(()=>{
    const onStorage = (e)=>{
      if(e.key === 'user' || e.key === 'token'){
        try{ const raw = localStorage.getItem('user'); setUser(raw? JSON.parse(raw) : null) }catch(e){ setUser(null) }
      }
    }
    const onRoute = ()=>{ try{ const raw = localStorage.getItem('user'); setUser(raw? JSON.parse(raw) : null) }catch(e){ setUser(null) } }
    window.addEventListener('storage', onStorage)
    // listen to Next route changes
    const handler = () => onRoute()
    // router.events may not be present in some environments; guard
    if(router && router.events && router.events.on) router.events.on('routeChangeComplete', handler)
    return ()=>{
      window.removeEventListener('storage', onStorage)
      if(router && router.events && router.events.off) router.events.off('routeChangeComplete', handler)
    }
  }, [])

  useEffect(()=>{
    async function fetchCount(){
      try{
        if(user && user.role === 'assessor'){
          const resp = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000') + '/users/pending', { headers: { 'Authorization': 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('token') : '') } })
          if(resp.ok){
            const data = await resp.json()
            const newCount = Array.isArray(data) ? data.length : 0
            setPendingCount(newCount)
            try{ localStorage.setItem('pendingCount', String(newCount)) }catch(e){}
          }
        }
      }catch(e){ /* ignore */ }
    }
    // start polling when assessor
    if(user && user.role === 'assessor'){
      const prevRef = { value: pendingCount }
      const wrapped = async ()=>{
        await fetchCount()
        try{
          const el = document.querySelector('.badge')
          const newCount = parseInt(localStorage.getItem('pendingCount')||'0',10)
          if(el && newCount > prevRef.value){ el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse') }
          prevRef.value = newCount
        }catch(e){}
      }
      wrapped()
      pollRef.current = setInterval(wrapped, 30000)
    }
    return ()=>{ if(pollRef.current) clearInterval(pollRef.current) }
  }, [user])

  function logout(){
    try{ localStorage.removeItem('token'); localStorage.removeItem('user') }catch(e){}
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="main-nav">
      {!user && (
        <>
          <Link href="/">Home</Link>
          {' | '}
        </>
      )}
      {user ? (
        <>
          {user.role === 'assessor' && (
            <>
              <Link href="/assessor/dashboard">Assessor</Link>
              {' | '}
              <Link href="/assessor/pending">Pending {pendingCount>0 && <span className={"badge" + (pendingCount>0? '': '')}>{pendingCount}</span>}</Link>
              {' | '}
              <Link href="/assessor/resources">Resources</Link>
              {' | '}
              <Link href="/assessor/learners">Manage Learners</Link>
              {' | '}
            </>
          )}
          {user.role === 'learner' && (
            <>
              <Link href="/learner/dashboard">Dashboard</Link>
              {' | '}
              <Link href="/resources">Resources</Link>
              {' | '}
            </>
          )}
          <span className="nav-user">{user.name} ({user.role})</span>
          {' | '}
          <button className="btn-logout" onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          {' | '}
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  )
}
