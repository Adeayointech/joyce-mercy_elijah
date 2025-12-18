import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import toast from '../../utils/toast';
import RequireAuth from '../../components/RequireAuth';

function PendingInner(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const intervalRef = useRef(null)

  useEffect(()=>{
    fetchPending()
    // poll every 15 seconds
    intervalRef.current = setInterval(fetchPending, 15000)
    return ()=> clearInterval(intervalRef.current)
  }, [])

  async function fetchPending() {
    setLoading(true);
    setError('');
    try {
      // Query users where approved is false and active is true
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('approved', false)
        .eq('active', true);
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError('Failed to load pending users');
    }
    setLoading(false);
  }

  async function approve(id) {
    if (!confirm('Approve this user?')) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ approved: true })
        .eq('id', id);
      if (error) throw error;
      fetchPending();
      toast('User approved', 'success');
    } catch (err) {
      toast('Failed to approve', 'error');
    }
  }

  async function decline(id) {
    if (!confirm('Decline this user? This will deactivate the account.')) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: false })
        .eq('id', id);
      if (error) throw error;
      fetchPending();
      toast('User declined', 'success');
    } catch (err) {
      toast('Failed to decline', 'error');
    }
  }

  return (
    <div>
      <h2>Pending Users</h2>
      <div style={{ marginBottom: 8 }}>
        <button onClick={fetchPending} disabled={loading}>Refresh</button>
        {loading && <span style={{ marginLeft: 8 }}>Loading...</span>}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {users.length===0 && !error ? <p>No pending users.</p> : (
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Body</th><th>Level</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.awarding_body}</td>
                <td>{u.level}</td>
                <td>
                  <button className="btn-approve" onClick={()=>approve(u.id)}>Approve</button>
                  {' '}
                  <button className="btn-decline" onClick={()=>decline(u.id)}>Decline</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function Page(){
  return (
    <RequireAuth role="assessor">
      <PendingInner />
    </RequireAuth>
  )
}
