import Link from 'next/link'

export default function Home(){
  return (
    <div>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>e-Portfolio</h1>
        <p className="muted">Upload assignments, receive assessor feedback, and browse resources filtered by awarding body and level.</p>
        <div style={{ marginTop: 12 }}>
          <Link href="/register"><button className="btn-primary">Register</button></Link>
          {' '}
          <Link href="/login"><button className="btn-ghost">Login</button></Link>
        </div>
      </section>

      <section className="card">
        <h3>Features</h3>
        <ul>
          <li>Role-based access: Learners & Assessors</li>
          <li>Assessor approval workflow for new registrations</li>
          <li>Upload assignments and receive corrected files</li>
          <li>Resource library grouped by type and filtered by awarding body/level</li>
        </ul>
      </section>
    </div>
  )
}
