import { useEffect, useRef, useState } from 'react'

export default function ToastHost(){
  const [toasts, setToasts] = useState([])
  const timeoutsRef = useRef({})

  useEffect(()=>{
    function handler(e){
      const id = Date.now() + Math.random()
      const t = { id, message: e.detail.message, type: e.detail.type || 'info' }
      setToasts(s => [...s, t])
      // auto-dismiss after 6s
      const to = setTimeout(()=> removeToast(id), 6000)
      timeoutsRef.current[id] = to
    }
    window.addEventListener('app-toast', handler)
    return ()=> window.removeEventListener('app-toast', handler)
  }, [])

  function removeToast(id){
    setToasts(s => s.filter(x=>x.id!==id))
    if(timeoutsRef.current[id]){
      clearTimeout(timeoutsRef.current[id])
      delete timeoutsRef.current[id]
    }
  }

  if(!toasts.length) return null

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }

  return (
    <div aria-live="polite" role="status" style={{ position: 'fixed', right: 18, top: 18, zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={()=> removeToast(t.id)}
          onMouseEnter={()=> {
            if(timeoutsRef.current[t.id]){ clearTimeout(timeoutsRef.current[t.id]) }
          }}
          onMouseLeave={()=> {
            if(!timeoutsRef.current[t.id]){
              timeoutsRef.current[t.id] = setTimeout(()=> removeToast(t.id), 3000)
            }
          }}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 260,
            maxWidth: 360,
            padding: '12px 14px',
            borderRadius: 10,
            boxShadow: '0 10px 30px rgba(16,24,40,0.16)',
            background: t.type==='error' ? '#fff5f5' : (t.type==='success' ? '#f3fff6' : '#ffffff'),
            border: t.type==='error' ? '1px solid #ffd2d2' : '1px solid #e6edf3',
            color: '#0b2540',
            fontSize: 14,
            lineHeight: '18px'
          }}
        >
          <div style={{ fontSize: 18 }}>{icons[t.type] || icons.info}</div>
          <div style={{ flex: 1 }}>{t.message}</div>
        </div>
      ))}
    </div>
  )
}
