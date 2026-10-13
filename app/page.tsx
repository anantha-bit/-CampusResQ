"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Emergency {
  emergency_id: number;
  emergency_type: string;
  priority: string;
  description: string;
  status: string;
  building?: string;
  floor?: string | number;
  room?: string;
  created_at?: string;
}

export default function Dashboard() {
  const router = useRouter();

  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchEmergencies() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/emergencies", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (cancelled) return;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load emergency records."
          );
        }

        const records = Array.isArray(result.data) ? result.data : [];

        if (!cancelled) {
          setEmergencies(records);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Dashboard loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the dashboard."
        );

        setEmergencies([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEmergencies();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const totalIncidents = emergencies.length;

  const activeCount = emergencies.filter(
    (emergency) => emergency.status === "ACTIVE"
  ).length;

  const inProgressCount = emergencies.filter(
    (emergency) => emergency.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = emergencies.filter(
    (emergency) => emergency.status === "RESOLVED"
  ).length;

  return (
    <main className="dashboard">
      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          padding: 32px;
          background: #f4f7fb;
          color: #172033;
          font-family: Arial, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }

        .brand {
          font-size: 30px;
          font-weight: 800;
          color: #173b32;
        }

        .brand span {
          color: #18a875;
        }

        .subtitle {
          margin-top: 8px;
          color: #667085;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .login-link {
          display: inline-block;
          padding: 11px 18px;
          border-radius: 8px;
          background: #16845d;
          color: white;
          text-decoration: none;
          font-weight: 700;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 28px;
          padding: 28px;
          border-radius: 16px;
          background: linear-gradient(120deg, #073b2c, #087f5b);
          color: white;
          box-shadow: 0 6px 18px rgba(16, 24, 40, 0.1);
        }

        .hero-content {
          flex: 1;
          min-width: 230px;
        }

        .hero h1 {
          margin: 0 0 10px;
          font-size: 28px;
        }

        .hero p {
          margin: 0;
          max-width: 560px;
          line-height: 1.6;
          color: #e0f2eb;
        }

        .report-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 22px;
          border-radius: 10px;
          background: #ff8a00;
          color: white;
          text-decoration: none;
          font-size: 16px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .report-button:hover {
          background: #e87500;
          transform: translateY(-2px);
        }

        .report-icon {
          font-size: 23px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5eaf0;
          border-radius: 14px;
          padding: 23px;
          box-shadow: 0 3px 12px rgba(16, 24, 40, 0.04);
        }

        .stat-label {
          color: #667085;
          font-size: 14px;
        }

        .stat-number {
          margin-top: 12px;
          font-size: 32px;
          font-weight: 800;
        }

        .panel {
          padding: 24px;
          background: white;
          border: 1px solid #e5eaf0;
          border-radius: 14px;
          box-shadow: 0 3px 12px rgba(16, 24, 40, 0.04);
        }

        .panel h2 {
          margin: 0 0 18px;
          font-size: 21px;
        }

        .message {
          padding: 15px;
          border-radius: 8px;
          background: #fef3f2;
          color: #b42318;
          margin-bottom: 16px;
        }

        .empty {
          padding: 25px 0;
          color: #667085;
          text-align: center;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th,
        td {
          padding: 14px 12px;
          border-bottom: 1px solid #eaecf0;
          font-size: 14px;
        }

        th {
          background: #f9fafb;
          color: #475467;
        }

        .badge {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          background: #eef2f6;
          font-size: 12px;
          font-weight: 700;
        }

        .links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .links a {
          padding: 12px 16px;
          background: white;
          border: 1px solid #d0d5dd;
          border-radius: 8px;
          color: #344054;
          text-decoration: none;
          font-weight: 600;
        }

        .links a:hover {
          background: #f0fdf4;
          border-color: #18a875;
        }

        @media (max-width: 800px) {
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dashboard {
            padding: 18px;
          }

          .hero h1 {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .stats {
            grid-template-columns: 1fr;
          }

          .hero {
            padding: 22px;
          }

          .report-button {
            width: 100%;
          }
        }
      `}</style>

      <header className="header">
        <div>
          <div className="brand">
            Campus<span>ResQ</span>
          </div>

          <p className="subtitle">
            Campus Emergency Response Dashboard
          </p>
        </div>

        <div className="header-actions">
          <a className="login-link" href="/login">
            Sign In
          </a>
        </div>
      </header>

      {error && (
        <div className="message" role="alert">
          {error}
        </div>
      )}

      {/* Prominent emergency reporting section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Need Emergency Assistance?</h1>

          <p>
            Report a campus emergency quickly. Provide the incident type,
            location, priority, and details so the response team can act.
          </p>
        </div>

        <a className="report-button" href="/report-emergency">
          <span className="report-icon">🚨</span>
          Report Emergency
        </a>
      </section>

      <section className="stats">
        <article className="stat-card">
          <div className="stat-label">Total Incidents</div>
          <div className="stat-number">
            {loading ? "..." : totalIncidents}
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-label">Active Incidents</div>
          <div className="stat-number">
            {loading ? "..." : activeCount}
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-number">
            {loading ? "..." : inProgressCount}
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-label">Resolved Incidents</div>
          <div className="stat-number">
            {loading ? "..." : resolvedCount}
          </div>
        </article>
      </section>

      <section className="panel">
        <h2>Recent Emergency Reports</h2>

        {loading ? (
          <div className="empty">Loading emergency records...</div>
        ) : emergencies.length === 0 ? (
          <div className="empty">
            {error
              ? "Emergency records could not be displayed."
              : "No emergency records found."}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Emergency Type</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {emergencies.slice(0, 10).map((emergency) => (
                  <tr key={emergency.emergency_id}>
                    <td>{emergency.emergency_id}</td>

                    <td>{emergency.emergency_type}</td>

                    <td>
                      {[
                        emergency.building,
                        emergency.floor,
                        emergency.room,
                      ]
                        .filter(
                          (value) =>
                            value !== undefined &&
                            value !== null &&
                            value !== ""
                        )
                        .join(", ") || "Location unavailable"}
                    </td>

                    <td>
                      <span className="badge">
                        {emergency.priority}
                      </span>
                    </td>

                    <td>
                      <span className="badge">
                        {emergency.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <nav className="links">
        <a href="/report-emergency">🚨 Report Emergency</a>
        <a href="/emergency-reports">Emergency Reports</a>
        <a href="/resources">Campus Resources</a>
        <a href="/locations">Campus Locations</a>
        <a href="/reports">Reports & Analytics</a>
      </nav>
    </main>
  );
}