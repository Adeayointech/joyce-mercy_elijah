import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../utils/supabase'
import toast from '../../../utils/toast'
import RequireAuth from '../../../components/RequireAuth'

function FeedbackForm({ assignmentId, onAdded }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  async function submit(e) {
    e && e.preventDefault();
    if (!text) return toast('Please enter feedback', 'error');
    setLoading(true);
    try {
      let fileUrl = null, filename = null, storagePath = null;
      if (file) {
        storagePath = `feedback/${assignmentId}_${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('assignments').upload(storagePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('assignments').getPublicUrl(storagePath);
        fileUrl = urlData.publicUrl;
        filename = file.name;
      }
      // Get assessor name from current user
      const { data: { user } } = await supabase.auth.getUser();
      const assessor_name = user?.email || 'Assessor';
      // Insert feedback into feedback table (or update assignment row if feedback is an array column)
      const feedbackObj = {
        id: Date.now().toString(),
        assessor_name,
        comment: text,
        filename,
        url: fileUrl,
        storagePath,
        created_at: new Date().toISOString(),
        assignment_id: assignmentId
      };
      // Assuming feedback is a separate table
      const { error: feedbackError } = await supabase.from('feedback').insert([feedbackObj]);
      if (feedbackError) throw feedbackError;
      setText(''); setFile(null);
      if (onAdded) onAdded();
      toast('Feedback sent', 'success');
    } catch (err) {
      toast(err.message || 'Failed to send feedback', 'error');
    }
    setLoading(false);
  }
  return (
    <form onSubmit={submit} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <input placeholder="Add feedback" value={text} onChange={e => setText(e.target.value)} style={{ width: 220 }} />
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button className="btn-approve" type="submit" disabled={loading}>{loading ? '...' : 'Send'}</button>
    </form>
  );
}

export default function LearnerDetail(){
  const router = useRouter()
  const { id } = router.query
  const [assignments, setAssignments] = useState([])

  useEffect(() => { if (id) fetchAssignments(id); }, [id]);

  async function fetchAssignments(uid) {
    try {
      // Fetch assignments for this learner
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('userId', uid);
      if (error) throw error;
      // Fetch feedback for all assignments
      const assignmentIds = assignmentsData.map(a => a.id);
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*')
        .in('assignment_id', assignmentIds);
      // Attach feedback to assignments
      const assignmentsWithFeedback = assignmentsData.map(a => ({
        ...a,
        feedback: feedbackData ? feedbackData.filter(f => f.assignment_id === a.id) : []
      }));
      setAssignments(assignmentsWithFeedback);
    } catch (err) {
      toast('Failed to load assignments', 'error');
    }
  }

  function downloadAssignment(url, filename) {
    const a = document.createElement('a');
    a.href = url; a.download = filename || 'assignment';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function downloadFeedback(url, filename) {
    const a = document.createElement('a');
    a.href = url; a.download = filename || 'file';
    document.body.appendChild(a); a.click(); a.remove();
  }

  return (
    <RequireAuth role="assessor">
      <div>
        <h2>Learner Submissions</h2>
        <p className="muted">Showing submissions for learner id: {id}</p>
        <section className="card">
          <h3>Assignments</h3>
          <table>
            <thead>
              <tr><th>Title</th><th>Uploaded</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.title || a.filename}</div>
                    <div className="muted">{a.description}</div>
                    {a.feedback && a.feedback.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Feedback:</strong>
                        <ul>
                          {a.feedback.map(f => (
                            <li key={f.id}>
                              <em>{f.assessor_name}</em>: {f.comment}
                              {f.url && (<><br /><a href="#" onClick={e => { e.preventDefault(); downloadFeedback(f.url, f.filename) }}>Download corrected file</a></>)}
                              <div className="muted">{new Date(f.created_at).toLocaleString()}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                  <td className="muted">{a.uploaded_at ? new Date(a.uploaded_at).toLocaleString() : ''}</td>
                  <td>
                    <div className="actions">
                      <a href="#" onClick={e => { e.preventDefault(); downloadAssignment(a.url, a.filename) }}>Download</a>
                      <FeedbackForm assignmentId={a.id} onAdded={() => fetchAssignments(id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </RequireAuth>
  )
}
