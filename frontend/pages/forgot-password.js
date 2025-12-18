import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function Forgot(){
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e){
    e.preventDefault();
    setMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMsg(error.message || 'Error sending reset email');
    } else {
      setMsg('Password reset email sent! Check your inbox.');
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Forgot Password</h2>
      <form onSubmit={submit}>
        <div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your email" /></div>
        <div><button type="submit">Request Reset</button></div>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
