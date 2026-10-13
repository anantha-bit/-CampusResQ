"use client";

import { useCallback, useEffect, useState } from "react";

type Emergency = {
  emergency_id: number;
  reported_by: number;
  location_id: number;
  emergency_type: string;
  priority: string;
  description: string;
  status: string;
  created_at: string;
  building: string;
  floor: string | number;
  room: string;
};

export default function EmergencyReportsPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");

  const loadEmergencies = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/emergencies", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401) {
        setEmergencies([]);
        setError("Please log in to view emergency reports.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load emergency reports."
        );
      }

      /*
       * The current /api/emergencies route returns:
       * { success: true, data: [...] }
       *
       * The fallback supports the older:
       * { success: true, emergencies: [...] }
       */
      const records = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.emergencies)
          ? data.emergencies
          : [];

      setEmergencies(records);
    } catch (err) {
      console.error("Emergency reports loading error:", err);
      setEmergencies([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load emergency reports."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmergencies();
  }, [loadEmergencies]);

  const safeEmergencies = Array.isArray(emergencies)
    ? emergencies
    : [];

  const filteredEmergencies = safeEmergencies.filter((emergency) => {
    const text = search.toLowerCase();

    const matchesSearch = [
      emergency.emergency_type,
      emergency.description,
      emergency.building,
      emergency.floor,
      emergency.room,
      emergency.emergency_id,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(text)
    );

    const matchesStatus =
      status === "ALL" || emergency.status === status;

    const matchesPriority =
      priority === "ALL" || emergency.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const activeCount = safeEmergencies.filter(
    (emergency) => emergency.status === "ACTIVE"
  ).length;

  const progressCount = safeEmergencies.filter(
    (emergency) => emergency.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = safeEmergencies.filter(
    (emergency) => emergency.status === "RESOLVED"
  ).length;

  function priorityClass(value: string) {
    switch (value) {
      case "CRITICAL":
        return "critical";
      case "HIGH":
        return "high";
      case "MEDIUM":
        return "medium";
      default:
        return "low";
    }
  }

  function statusClass(value: string) {
    switch (value) {
      case "ACTIVE":
        return "active";
      case "IN_PROGRESS":
        return "progress";
      case "RESOLVED":
        return "resolved";
      case "CANCELLED":
        return "cancelled";
      default:
        return "";
    }
  }

  function displayStatus(value: string) {
    return String(value ?? "UNKNOWN").replace(/_/g, " ");
  }

  async function updateStatus(
    emergencyId: number,
    newStatus: string
  ) {
    try {
      setUpdatingId(emergencyId);
      setError("");

      const response = await fetch("/api/emergencies", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emergency_id: emergencyId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError("Please log in before updating emergency status.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update emergency status."
        );
      }

      await loadEmergencies();
    } catch (err) {
      console.error("Emergency status update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update emergency status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="logo">
          Campus<span>ResQ</span>
        </div>

        <div className="system-name">
          Campus Emergency Response System
        </div>

        <nav>
          <a href="/">Dashboard</a>

          <a href="/emergency-reports" className="selected">
            Emergency Reports
          </a>

          <a href="/resources">Resources</a>
          <a href="/locations">Locations</a>
          <a href="/reports">Reports &amp; Analytics</a>
        </nav>

        <div className="hotline">
          <strong>Emergency Hotline</strong>
          <div>112</div>
          <span>For immediate assistance</span>
        </div>
      </aside>

      <main>
        <h1>Emergency Reports</h1>

        <p className="subtitle">
          Monitor and manage campus emergency response activities.
        </p>

        <div className="stats">
          <div className="card">
            <span>Total Incidents</span>
            <strong>{loading ? "..." : safeEmergencies.length}</strong>
            <small>Recorded emergencies</small>
          </div>

          <div className="card">
            <span>Active</span>
            <strong className="red">
              {loading ? "..." : activeCount}
            </strong>
            <small className="red">Requires attention</small>
          </div>

          <div className="card">
            <span>In Progress</span>
            <strong className="orange">
              {loading ? "..." : progressCount}
            </strong>
            <small className="orange">
              Response teams assigned
            </small>
          </div>

          <div className="card">
            <span>Resolved</span>
            <strong className="green">
              {loading ? "..." : resolvedCount}
            </strong>
            <small className="green">
              Successfully handled
            </small>
          </div>
        </div>

        <section className="reports">
          <div className="reports-header">
            <div>
              <h2>Emergency Reports</h2>
              <p>Search and filter reported emergencies.</p>
            </div>

            <button
              onClick={() => void loadEmergencies()}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search emergencies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search emergencies"
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              aria-label="Filter by priority"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="report-heading">
            <h2>Reports</h2>
            <p>
              Showing {filteredEmergencies.length} of{" "}
              {safeEmergencies.length} incidents
            </p>
          </div>

          {error && (
            <div className="message error-message" role="alert">
              {error}

              {error.toLowerCase().includes("log in") && (
                <div className="login-action">
                  <a href="/login">Go to Login</a>
                </div>
              )}

              <button
                className="retry"
                onClick={() => void loadEmergencies()}
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="message">
              Loading emergency reports...
            </div>
          ) : !error && filteredEmergencies.length === 0 ? (
            <div className="message">
              {safeEmergencies.length === 0
                ? "No emergency records were returned by the server."
                : "No emergencies match your search or filters."}
            </div>
          ) : (
            filteredEmergencies.map((emergency) => (
              <article
                className="emergency"
                key={emergency.emergency_id}
              >
                <div className="emergency-top">
                  <div className="title">
                    <h3>
                      {emergency.emergency_type || "Emergency"}
                    </h3>

                    <span
                      className={`badge ${priorityClass(
                        emergency.priority
                      )}`}
                    >
                      {emergency.priority || "UNKNOWN"}
                    </span>

                    <span
                      className={`badge ${statusClass(
                        emergency.status
                      )}`}
                    >
                      {displayStatus(emergency.status)}
                    </span>
                  </div>

                  <div className="actions">
                    {emergency.status === "ACTIVE" && (
                      <button
                        className="start"
                        disabled={updatingId === emergency.emergency_id}
                        onClick={() =>
                          void updateStatus(
                            emergency.emergency_id,
                            "IN_PROGRESS"
                          )
                        }
                      >
                        {updatingId === emergency.emergency_id
                          ? "Updating..."
                          : "Start Response"}
                      </button>
                    )}

                    {emergency.status === "IN_PROGRESS" && (
                      <button
                        className="resolve"
                        disabled={updatingId === emergency.emergency_id}
                        onClick={() =>
                          void updateStatus(
                            emergency.emergency_id,
                            "RESOLVED"
                          )
                        }
                      >
                        {updatingId === emergency.emergency_id
                          ? "Updating..."
                          : "Mark Resolved"}
                      </button>
                    )}

                    {emergency.status === "RESOLVED" && (
                      <span className="handled">
                        ✓ Successfully handled
                      </span>
                    )}
                  </div>
                </div>

                <div className="details">
                  <div>
                    <b>Location:</b>{" "}
                    {emergency.building || "Unknown"} •{" "}
                    {emergency.room || "Room unavailable"}
                  </div>

                  <div>
                    <b>Floor:</b>{" "}
                    {emergency.floor ?? "Not specified"}
                  </div>

                  <div>
                    <b>Incident ID:</b> #{emergency.emergency_id}
                  </div>

                  <div>
                    <b>Reported by:</b> User #{emergency.reported_by}
                  </div>
                </div>

                <div className="description">
                  <strong>DESCRIPTION</strong>
                  <p>
                    {emergency.description || "No description provided."}
                  </p>
                </div>

                <div className="date">
                  Reported{" "}
                  {emergency.created_at
                    ? new Date(emergency.created_at).toLocaleString(
                        "en-IN"
                      )
                    : "Date unavailable"}
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f1f5f9;
          color: #111827;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 250px;
          background: white;
          border-right: 1px solid #94a3b8;
          padding: 28px 20px;
          box-sizing: border-box;
          z-index: 2;
        }

        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #020617;
        }

        .logo span {
          color: #00b981;
        }

        .system-name {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 35px;
        }

        nav a {
          display: block;
          padding: 14px;
          margin-bottom: 5px;
          border-radius: 8px;
          color: #28486d;
          text-decoration: none;
        }

        nav a:hover,
        nav .selected {
          background: #ecfdf5;
          color: #008f69;
        }

        .hotline {
          margin-top: 45px;
          background: #fff1f2;
          color: #dc2626;
          padding: 18px;
          border-radius: 12px;
        }

        .hotline div {
          font-size: 28px;
          font-weight: bold;
          margin: 8px 0;
        }

        .hotline span {
          font-size: 13px;
        }

        main {
          margin-left: 250px;
          padding: 40px 5%;
        }

        h1 {
          margin: 0;
          font-size: 34px;
        }

        .subtitle {
          color: #58718f;
          font-size: 17px;
          margin-bottom: 30px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 30px;
        }

        .card {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 24px;
        }

        .card span {
          display: block;
          color: #58718f;
        }

        .card strong {
          display: block;
          font-size: 30px;
          margin: 8px 0;
        }

        .card small {
          color: #91a4bf;
        }

        .red {
          color: #ef1111 !important;
        }

        .orange {
          color: #f28c00 !important;
        }

        .green {
          color: #00a873 !important;
        }

        .reports {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          overflow: hidden;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 25px;
        }

        .reports-header h2,
        .report-heading h2 {
          margin: 0;
        }

        .reports-header p,
        .report-heading p {
          color: #58718f;
        }

        .reports-header button,
        .retry {
          padding: 11px 18px;
          border: 1px solid #94a3b8;
          background: white;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .filters {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          padding: 0 25px 25px;
        }

        .filters input,
        .filters select {
          min-width: 0;
          height: 52px;
          border: 1px solid #94a3b8;
          border-radius: 8px;
          padding: 0 15px;
          font-size: 15px;
          background: white;
        }

        .report-heading {
          border-top: 1px solid #cbd5e1;
          padding: 22px 25px;
        }

        .report-heading p {
          margin-bottom: 0;
        }

        .emergency {
          border-top: 1px solid #cbd5e1;
          padding: 28px 25px;
        }

        .emergency-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .title {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .title h3 {
          margin: 0;
          font-size: 20px;
        }

        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .critical {
          background: #fee2e2;
          color: #dc2626;
        }

        .high {
          background: #fff0d6;
          color: #ed7c00;
        }

        .medium {
          background: #dbeafe;
          color: #2563eb;
        }

        .low {
          background: #e2e8f0;
          color: #475569;
        }

        .active {
          background: #ffe0e0;
          color: #dc2626;
        }

        .progress {
          background: #fff0bd;
          color: #d97706;
        }

        .resolved {
          background: #d1fae5;
          color: #008f69;
        }

        .cancelled {
          background: #e5e7eb;
          color: #374151;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .start,
        .resolve {
          border: none;
          color: white;
          padding: 12px 18px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .start {
          background: #ff9800;
        }

        .resolve {
          background: #00a873;
        }

        .handled {
          background: #ecfdf5;
          color: #008f69;
          padding: 10px 14px;
          border-radius: 8px;
          font-weight: bold;
        }

        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 22px;
          color: #506b8b;
        }

        .description {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin-top: 20px;
          overflow-wrap: anywhere;
        }

        .description strong {
          color: #8da0bb;
          font-size: 12px;
        }

        .description p {
          margin-bottom: 0;
        }

        .date {
          margin-top: 15px;
          color: #8da0bb;
          font-size: 13px;
        }

        .message {
          padding: 35px 25px;
          text-align: center;
          color: #64748b;
        }

        .error-message {
          color: #b42318;
          background: #fef3f2;
          border-top: 1px solid #fecdca;
        }

        .login-action {
          margin-top: 12px;
        }

        .login-action a {
          color: #067647;
          font-weight: bold;
        }

        .retry {
          display: block;
          margin: 15px auto 0;
        }

        @media (max-width: 1000px) {
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .sidebar {
            position: static;
            width: 100%;
          }

          main {
            margin-left: 0;
            padding: 25px 16px;
          }

          .stats,
          .filters,
          .details {
            grid-template-columns: 1fr;
          }

          .reports-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}