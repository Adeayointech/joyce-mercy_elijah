import { useState } from 'react'
import { supabase } from '../../utils/supabase'
import toast from '../../utils/toast'
import RequireAuth from '../../components/RequireAuth'

function AssessorResources(){
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('PDF')
  const [body, setBody] = useState('NCFE')
  const [level, setLevel] = useState(3)

  async function submit(e) {
    e.preventDefault();
    if (!file) return toast('Select a file to upload', 'error');
    try {
      // Upload file to Supabase Storage
      const filePath = `resources/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('resources').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('resources').getPublicUrl(filePath);
      const url = urlData.publicUrl;
      // Save metadata to Supabase DB
      const { error: insertError } = await supabase.from('resources').insert([
        {
          title,
          type,
          awarding_body: body,
          level: Number(level),
          url,
          filename: file.name,
          uploaded_at: new Date().toISOString()
        }
      ]);
      if (insertError) throw insertError;
      setFile(null); setTitle('');
      toast('Resource uploaded', 'success');
    } catch (err) {
      toast(err.message || 'Upload failed', 'error');
    }
  }

  return (
    <div>
      <h2>Upload Resource (Assessor)</h2>
      <form onSubmit={submit} className="card">
        <div className="form-row"><label>Title</label><br/><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="title" /></div>
        <div className="form-row"><label>Type</label><br/>
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option>PDF</option>
            <option>Image</option>
            <option>Video</option>
            <option>Slides</option>
            <option>Docx</option>
            <option>Other</option>
          </select>
        </div>
        <div className="form-row"><label>Awarding Body</label><br/>
          <select value={body} onChange={e=>setBody(e.target.value)}>
            <option>NCFE</option>
            <option>FOCUS</option>
            <option>PVG</option>
            <option>HIGHFIELD</option>
          </select>
        </div>
        <div className="form-row"><label>Level</label><br/><input type="number" value={level} onChange={e=>setLevel(e.target.value)} placeholder="level" /></div>
        <div className="form-row"><input type="file" onChange={e=>setFile(e.target.files[0])} /></div>
        <div><button type="submit" className="btn-primary">Upload Resource</button></div>
      </form>
    </div>
  )
}

export default function Page(){
  return (
    <RequireAuth role="assessor">
      <AssessorResources />
    </RequireAuth>
  )
}
