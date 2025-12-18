import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import toast from '../../utils/toast'
import RequireAuth from '../../components/RequireAuth'

function LearnerDashboard(){
  const [assignments, setAssignments] = useState([])
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')

  useEffect(() => {
    const user = supabase.auth.getUser().then(({ data }) => {
      if (data?.user) fetchAssignments(data.user.id);
    });
  }, []);

  async function fetchAssignments(uid) {
    try {
      const { data, error } = await supabase.from('assignments').select('*').eq('user_id', uid);
      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      toast('Failed to load assignments', 'error');
    }
  }

  async function downloadFeedback(feedbackId, filename){
    try{
      const token = localStorage.getItem('token')
      const resp = await fetch((process.env.NEXT_PUBLIC_API_BASE||'http://localhost:4000') + `/feedback/${feedbackId}/download`, { headers: { 'Authorization': 'Bearer ' + token } })
      if(!resp.ok) return toast('Download failed', 'error')
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'file'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    }catch(err){ toast('Download failed', 'error') }
  }

  function downloadAssignment(url, filename) {
    const a = document.createElement('a');
    a.href = url; a.download = filename || 'assignment';
    document.body.appendChild(a); a.click(); a.remove();
  }

  async function deleteAssignment(id, storagePath) {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
      if (storagePath) {
        await supabase.storage.from('assignments').remove([storagePath]);
      }
      toast('Submission deleted', 'success');
      const user = await supabase.auth.getUser();
      if (user.data?.user) fetchAssignments(user.data.user.id);
    } catch (err) {
      toast('Delete failed', 'error');
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return toast('Select a file to upload', 'error');
    const user = await supabase.auth.getUser();
    if (!user.data?.user) return toast('Not authenticated', 'error');
    try {
      // Upload file to Supabase Storage
      const storagePath = `assignments/${user.data.user.id}_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('assignments').upload(storagePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('assignments').getPublicUrl(storagePath);
      const url = urlData.publicUrl;
      // Save metadata to Supabase DB
      const { error: insertError } = await supabase.from('assignments').insert([
        {
          user_id: user.data.user.id,
          title,
          description: desc,
          url,
          filename: file.name,
          storage_path: storagePath,
          uploaded_at: new Date().toISOString()
        }
      ]);
      if (insertError) throw insertError;
      setFile(null); setTitle(''); setDesc('');
      fetchAssignments(user.data.user.id);
      toast('Upload successful', 'success');
    } catch (err) {
      toast(err.message || 'Upload failed', 'error');
    }
  }

  return (
    <div>
      <h2>Learner Dashboard</h2>
      <p><a href="/resources">Browse Resources</a></p>
      <section>
        <h3>Upload Assignment</h3>
        <form onSubmit={submit}>
          <div><input type="text" placeholder="title" value={title} onChange={e=>setTitle(e.target.value)} /></div>
          <div><input type="text" placeholder="description" value={desc} onChange={e=>setDesc(e.target.value)} /></div>
          <div><input type="file" onChange={e=>setFile(e.target.files[0])} /></div>
          <div><button type="submit">Upload</button></div>
        </form>
      </section>

      <section>
        <h3>My Assignments</h3>
        <div className="card">
          {assignments.length === 0 && <p className="muted">No uploads yet</p>}
          <table>
            <thead><tr><th>Title</th><th>Uploaded</th><th>Actions</th></tr></thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.title || a.filename}</div>
                    <div className="muted">{a.description}</div>
                    {a.feedback && a.feedback.length>0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Feedback:</strong>
                        <ul>
                        {a.feedback.map(f=> <li key={f.id}><em>{f.assessor_name}</em>: {f.comment} {f.filename && (<><br/><a href="#" onClick={(e)=>{e.preventDefault(); downloadFeedback(f.id, f.filename)}}>Download corrected file</a></>)} <span className="muted">({new Date(f.created_at).toLocaleString()})</span></li>)}
                        </ul>
                      </div>
                    )}
                  </td>
                  <td className="muted">{a.uploaded_at ? new Date(a.uploaded_at).toLocaleString() : ''}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <a href="#" onClick={e=>{ e.preventDefault(); downloadAssignment(a.url, a.filename) }}>Download</a>
                      <a href="#" style={{ color: '#c33' }} onClick={e=>{ e.preventDefault(); deleteAssignment(a.id, a.storagePath) }}>Delete</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default function Page(){
  return (
    <RequireAuth role="learner">
      <LearnerDashboard />
    </RequireAuth>
  )
}
