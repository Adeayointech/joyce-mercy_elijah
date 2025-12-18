import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import toast from '../../utils/toast'
import RequireAuth from '../../components/RequireAuth'

export default function ManageLearners(){
  const [users, setUsers] = useState([])

  useEffect(()=>{ fetchUsers() }, [])

  async function fetchUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (!error) setUsers(data || []);
  }

  async function toggle(u) {
    if (u.active) {
      if (!confirm(`Deactivate ${u.email}?`)) return;
      try {
        const { error } = await supabase.from('users').update({ active: false }).eq('id', u.id);
        if (error) throw error;
        fetchUsers();
        toast('User deactivated', 'success');
      } catch (err) {
        toast('Failed to deactivate', 'error');
      }
    } else {
      if (!confirm(`Reactivate ${u.email}?`)) return;
      try {
        const { error } = await supabase.from('users').update({ active: true }).eq('id', u.id);
        if (error) throw error;
        fetchUsers();
        toast('User reactivated', 'success');
      } catch (err) {
        toast('Failed to reactivate', 'error');
      }
    }
  }

  return (
    <RequireAuth role="assessor">
      <div>
        <h2>Manage Learners</h2>
        <p className="muted">Activate or deactivate learner accounts.</p>
        <section className="card">
          <table>
            <thead><tr><th>Email</th><th>Name</th><th>Awarding Body</th><th>Level</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><Link href={`/assessor/learner/${u.id}`}>{u.email}</Link></td>
                  <td>{u.name}</td>
                  <td className="muted">{u.awarding_body}</td>
                  <td className="muted">{u.level}</td>
                  <td>{u.active ? (u.approved ? 'Active' : 'Pending') : 'Deactivated'}</td>
                  <td>{u.role !== 'assessor' && <button onClick={()=>toggle(u)} className={u.active? 'btn-decline':'btn-approve'}>{u.active? 'Deactivate':'Reactivate'}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </RequireAuth>
  )
}
