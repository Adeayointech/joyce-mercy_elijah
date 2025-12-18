import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabase'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      // Get user profile from user_metadata
      const user = data.user;
      if (user) {
        const userData = user.user_metadata || {};
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.role === 'assessor') router.push('/assessor/dashboard');
        else router.push('/learner/dashboard');
      } else {
        setError('User profile not found');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label><br />
          <input value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Login</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
