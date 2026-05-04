import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Not found</p>
        <h1 style={{ fontSize: 36 }}>Session missing</h1>
        <p className="hint-text" style={{ marginTop: 12 }}>
          This practice record does not exist in the demo data.
        </p>
        <Link className="primary-action" href="/" style={{ marginTop: 22 }}>
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
