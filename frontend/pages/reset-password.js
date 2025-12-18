import { supabase } from '../utils/supabase'
import { useState } from 'react'

export default function Reset(){
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e){
    e.preventDefault(); setMsg('')
    try {
      // The user should have landed here via the Supabase password reset link (with access_token in URL)
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setMsg(error.message || 'Error resetting password');
      else setMsg('Password reset. You can now login.');
    } catch (err) {
      setMsg('Error resetting password');
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        {/* Supabase handles the token in the URL automatically */}
        <div><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="new password" /></div>
        <div><button type="submit">Set Password</button></div>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
