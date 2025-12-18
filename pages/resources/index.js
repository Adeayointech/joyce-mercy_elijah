import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import toast from '../../utils/toast'

export default function Resources(){
  const [resources, setResources] = useState([])

  useEffect(()=>{ fetchResources() }, [])

  async function fetchResources() {
    try {
      const { data, error } = await supabase.from('resources').select('*');
      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      toast('Failed to load resources', 'error');
    }
  }

  function groupBy(arr, key){
    return arr.reduce((acc, item)=>{ (acc[item[key]] = acc[item[key]] || []).push(item); return acc }, {})
  }

  function downloadResource(url, filename) {
    // Direct download from Supabase Storage public URL
    const a = document.createElement('a');
    a.href = url; a.download = filename || 'resource';
    document.body.appendChild(a); a.click(); a.remove();
  }

  return (
    <div>
      <h2>Resources</h2>
      {resources.length===0 ? <p>No resources available.</p> : (
        (()=>{
          const grouped = groupBy(resources, 'type')
          return Object.keys(grouped).map(type => (
            <section key={type} className="card">
              <h3>{type.toUpperCase()}</h3>
              <ul>
                {grouped[type].map(r => (
                  <li key={r.id}>{r.title} — <a href="#" onClick={e=>{e.preventDefault(); downloadResource(r.url, r.filename)}}>Download</a></li>
                ))}
              </ul>
            </section>
          ))
        })()
      )}
    </div>
  )
}
