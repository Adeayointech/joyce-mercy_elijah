import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../utils/supabase'
import toast from '../../utils/toast'
import RequireAuth from '../../components/RequireAuth'

function FeedbackForm({ assignmentId, onAdded }){
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  async function submit(e){
    e && e.preventDefault()
    if(!text) return toast('Please enter feedback', 'error')
    setLoading(true)
    let resp
    try{
      const fd = new FormData()
      fd.append('comment', text)
      if(file) fd.append('file', file)
      resp = await api.post(`/assignments/${assignmentId}/feedback`, fd, true)
    }catch(e){ resp = { ok: false } }
    setLoading(false)
    if(resp.ok){ setText(''); if(onAdded) onAdded(); toast('Feedback sent', 'success') }
    else { const d = await resp.json(); toast(d.error||'Failed to send feedback', 'error') }
  }
  return (
    <form onSubmit={submit} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <input placeholder="Add feedback" value={text} onChange={e=>setText(e.target.value)} style={{ width: 220 }} />
      <input type="file" onChange={e=>setFile(e.target.files[0])} />
      <button className="btn-approve" type="submit" disabled={loading}>{loading? '...' : 'Send'}</button>
    </form>
  )
}

function AssessorDashboard(){
  const [assignments, setAssignments] = useState([])
  const [groups, setGroups] = useState([])

  function downloadAssignment(url, filename) {
    const a = document.createElement('a');
    a.href = url; a.download = filename || 'assignment';
    document.body.appendChild(a); a.click(); a.remove();
  }

  useEffect(() => { fetchAll() }, []);
  async function fetchAll() {
    try {
      const { data: d, error } = await supabase.from('assignments').select('*');
      if (error) throw error;
      setAssignments(d);
      // group by userId
      const map = {};
      for (const a of d) {
        const uid = a.userId || 'unknown';
        if (!map[uid]) map[uid] = { user_id: a.userId, student_name: a.student_name, student_email: a.student_email, student_awarding_body: a.student_awarding_body, student_level: a.student_level, count: 0, latest: null };
        map[uid].count++;
        if (!map[uid].latest) map[uid].latest = a;
        else if (a.uploaded_at && new Date(a.uploaded_at) > new Date(map[uid].latest.uploaded_at)) map[uid].latest = a;
      }
      setGroups(Object.values(map));
    } catch (err) {
      toast('Failed to load assignments', 'error');
    }
  }

  return (
    <div>
      <h2>Assessor Dashboard</h2>
      <section className="card">
        <h3>Learner Submissions (summary)</h3>
        <table>
          <thead>
            <tr><th>Student</th><th>Awarding Body</th><th>Level</th><th>Latest submission</th><th>Count</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={String(g.user_id || g.student_email)}>
                <td>{g.student_name || g.student_email || 'Unknown'}</td>
                <td className="muted">{g.student_awarding_body || '-'}</td>
                <td className="muted">{g.student_level || '-'}</td>
                <td>
                  {g.latest ? (
                    <>
                      <div style={{ fontWeight: 600 }}>{g.latest.title || g.latest.filename}</div>
                      <div className="muted">{g.latest.uploaded_at ? new Date(g.latest.uploaded_at).toLocaleString() : ''}</div>
                    </>
                  ) : <span className="muted">No submissions</span>}
                </td>
                <td><span className="badge">{g.count}</span></td>
                <td>
                  <div className="actions">
                    <Link href={`/assessor/learner/${g.user_id}`}><span style={{ cursor: 'pointer', color: '#0366d6' }}>View submissions</span></Link>
                    {g.latest && <a href="#" onClick={e=>{ e.preventDefault(); downloadAssignment(g.latest.url, g.latest.filename) }}>Download latest</a>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h3>Resources</h3>
        <p><a href="/assessor/resources">Manage Resources</a> — upload and assign awarding body/level</p>
      </section>
    </div>
  )
}

export default function Page(){
  return (
    <RequireAuth role="assessor">
      <AssessorDashboard />
    </RequireAuth>
  )
}
