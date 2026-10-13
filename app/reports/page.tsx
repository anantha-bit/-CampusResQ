"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Emergency = {
  emergency_id: number;
  emergency_type: string;
  priority: string;
  status: string;
  description: string;
  building: string;
  floor: string | number;
  room: string;
  created_at: string;
};

export default function ReportsPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError("Please log in to view Reports & Analytics.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch emergency records."
        );
      }

      // Support both the current and older API response formats.
      const records = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.emergencies)
          ? data.emergencies
          : [];

      setEmergencies(records);
    } catch (err) {
      console.error("Reports loading error:", err);
      setEmergencies([]);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmergencies();
  }, [loadEmergencies]);

  const statistics = useMemo(() => {
    const total = emergencies.length;

    const active = emergencies.filter(
      (item) => item.status === "ACTIVE"
    ).length;

    const inProgress = emergencies.filter(
      (item) => item.status === "IN_PROGRESS"
    ).length;

    const resolved = emergencies.filter(
      (item) => item.status === "RESOLVED"
    ).length;

    return {
      total,
      active,
      inProgress,
      resolved,
    };
  }, [emergencies]);

  const typeStats = useMemo(() => {
    const stats: Record<string, number> = {};

    emergencies.forEach((item) => {
      const type = item.emergency_type || "Unknown";

      stats[type] = (stats[type] || 0) + 1;
    });

    return stats;
  }, [emergencies]);

  const priorityStats = useMemo(() => {
    const stats: Record<string, number> = {};

    emergencies.forEach((item) => {
      const priority = item.priority || "Unknown";

      stats[priority] = (stats[priority] || 0) + 1;
    });

    return stats;
  }, [emergencies]);

  const locationStats = useMemo(() => {
    const stats: Record<string, number> = {};

    emergencies.forEach((item) => {
      const building = item.building || "Unknown building";
      const room = item.room || "Unknown room";
      const location = `${building} • ${room}`;

      stats[location] = (stats[location] || 0) + 1;
    });

    return stats;
  }, [emergencies]);

  function percentage(value: number) {
    if (statistics.total === 0) {
      return 0;
    }

    return Math.round((value / statistics.total) * 100);
  }

  function displayStatus(status: string) {
    return String(status || "UNKNOWN").replace(/_/g, " ");
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "ACTIVE":
        return "status-active";
      case "IN_PROGRESS":
        return "status-progress";
      case "RESOLVED":
        return "status-resolved";
      default:
        return "status-other";
    }
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p>
            Analyze campus emergency response activities and incidents.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={() => void loadEmergencies()}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>

          {error.toLowerCase().includes("log in") && (
            <a href="/login">Go to Login</a>
          )}

          <button
            className="retry-button"
            onClick={() => void loadEmergencies()}
          >
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-title">Total Incidents</div>
              <div className="card-number">{statistics.total}</div>
              <div className="card-description">
                All recorded emergencies
              </div>
            </div>

            <div className="summary-card">
              <div className="card-title">Active</div>
              <div className="card-number red">
                {statistics.active}
              </div>
              <div className="card-description red-text">
                Requires attention
              </div>
            </div>

            <div className="summary-card">
              <div className="card-title">In Progress</div>
              <div className="card-number orange">
                {statistics.inProgress}
              </div>
              <div className="card-description orange-text">
                Response teams assigned
              </div>
            </div>

            <div className="summary-card">
              <div className="card-title">Resolved</div>
              <div className="card-number green">
                {statistics.resolved}
              </div>
              <div className="card-description green-text">
                Successfully handled
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>Response Overview</h2>
                <p>
                  Current emergency response status distribution.
                </p>
              </div>
            </div>

            <div className="overview-grid">
              <div className="overview-item">
                <div className="overview-top">
                  <span>Active</span>
                  <strong>{statistics.active}</strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-red"
                    style={{
                      width: `${percentage(statistics.active)}%`,
                    }}
                  />
                </div>

                <small>
                  {percentage(statistics.active)}% of total incidents
                </small>
              </div>

              <div className="overview-item">
                <div className="overview-top">
                  <span>In Progress</span>
                  <strong>{statistics.inProgress}</strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-orange"
                    style={{
                      width: `${percentage(statistics.inProgress)}%`,
                    }}
                  />
                </div>

                <small>
                  {percentage(statistics.inProgress)}% of total incidents
                </small>
              </div>

              <div className="overview-item">
                <div className="overview-top">
                  <span>Resolved</span>
                  <strong>{statistics.resolved}</strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-green"
                    style={{
                      width: `${percentage(statistics.resolved)}%`,
                    }}
                  />
                </div>

                <small>
                  {percentage(statistics.resolved)}% of total incidents
                </small>
              </div>
            </div>
          </div>

          <div className="two-column">
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h2>Emergencies by Type</h2>
                  <p>Distribution of emergency categories.</p>
                </div>
              </div>

              <div className="stats-list">
                {Object.keys(typeStats).length === 0 ? (
                  <div className="empty">
                    No emergency data available.
                  </div>
                ) : (
                  Object.entries(typeStats).map(([type, count]) => (
                    <div className="stat-row" key={type}>
                      <div className="stat-label">
                        <span className="dot green-dot" />
                        <span>{type}</span>
                      </div>

                      <div className="stat-value">{count}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <div>
                  <h2>Emergencies by Priority</h2>
                  <p>Incidents grouped by priority level.</p>
                </div>
              </div>

              <div className="stats-list">
                {Object.keys(priorityStats).length === 0 ? (
                  <div className="empty">
                    No priority data available.
                  </div>
                ) : (
                  Object.entries(priorityStats).map(
                    ([priority, count]) => (
                      <div className="stat-row" key={priority}>
                        <div className="stat-label">
                          <span
                            className={`dot ${
                              priority === "CRITICAL"
                                ? "red-dot"
                                : priority === "HIGH"
                                  ? "orange-dot"
                                  : "blue-dot"
                            }`}
                          />

                          <span>{priority}</span>
                        </div>

                        <div className="stat-value">{count}</div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>Emergencies by Location</h2>
                <p>
                  Locations with reported emergency incidents.
                </p>
              </div>
            </div>

            <div className="location-table">
              <div className="table-header">
                <span>Location</span>
                <span>Incidents</span>
              </div>

              {Object.keys(locationStats).length === 0 ? (
                <div className="empty">
                  No location data available.
                </div>
              ) : (
                Object.entries(locationStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([location, count]) => (
                    <div className="table-row" key={location}>
                      <span>{location}</span>
                      <strong>{count}</strong>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>Recent Incidents</h2>
                <p>
                  Latest emergencies recorded in the system.
                </p>
              </div>
            </div>

            <div className="recent-list">
              {emergencies.slice(0, 5).map((incident) => (
                <div
                  className="recent-item"
                  key={incident.emergency_id}
                >
                  <div>
                    <div className="recent-title">
                      {incident.emergency_type || "Emergency"}

                      <span
                        className={`status ${getStatusClass(
                          incident.status
                        )}`}
                      >
                        {displayStatus(incident.status)}
                      </span>
                    </div>

                    <div className="recent-location">
                      {incident.building || "Unknown building"} •{" "}
                      {incident.room || "Unknown room"}
                    </div>
                  </div>

                  <div className="recent-priority">
                    {incident.priority || "UNKNOWN"}
                  </div>
                </div>
              ))}

              {emergencies.length === 0 && (
                <div className="empty">No incidents recorded.</div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .reports-page {
          min-height: 100vh;
          background: #f1f5f9;
          padding: 36px 42px 60px;
          color: #0f172a;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 30px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 700;
        }

        .page-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 17px;
        }

        .refresh-button,
        .retry-button {
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 9px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        .refresh-button:disabled {
          cursor: wait;
          opacity: 0.6;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.06);
        }

        .card-title {
          color: #64748b;
          font-size: 15px;
        }

        .card-number {
          margin-top: 10px;
          font-size: 32px;
          font-weight: 700;
        }

        .card-number.red,
        .red-text {
          color: #ef1111;
        }

        .card-number.orange,
        .orange-text {
          color: #e87500;
        }

        .card-number.green,
        .green-text {
          color: #00a878;
        }

        .card-description {
          margin-top: 8px;
          color: #94a3b8;
          font-size: 14px;
        }

        .section-card {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          margin-bottom: 25px;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.05);
        }

        .section-header {
          padding: 24px 28px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 22px;
        }

        .section-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .overview-grid {
          border-top: 1px solid #cbd5e1;
          padding: 25px 28px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 30px;
        }

        .overview-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .overview-top span {
          color: #475569;
          font-weight: 600;
        }

        .overview-top strong {
          font-size: 20px;
        }

        .progress {
          height: 9px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-red,
        .progress-orange,
        .progress-green {
          height: 100%;
          border-radius: 10px;
        }

        .progress-red {
          background: #ef1111;
        }

        .progress-orange {
          background: #f59e0b;
        }

        .progress-green {
          background: #00a878;
        }

        .overview-item small {
          display: block;
          margin-top: 8px;
          color: #94a3b8;
        }

        .two-column {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 25px;
        }

        .two-column .section-card {
          margin-bottom: 25px;
        }

        .stats-list,
        .location-table,
        .recent-list {
          border-top: 1px solid #cbd5e1;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 28px;
          border-bottom: 1px solid #e2e8f0;
        }

        .stat-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .green-dot {
          background: #00a878;
        }

        .red-dot {
          background: #ef1111;
        }

        .orange-dot {
          background: #f59e0b;
        }

        .blue-dot {
          background: #3b82f6;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 1fr 150px;
          gap: 12px;
          padding: 17px 28px;
        }

        .table-header {
          background: #f8fafc;
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
        }

        .table-row {
          border-top: 1px solid #e2e8f0;
        }

        .table-row strong {
          text-align: right;
        }

        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 20px 28px;
          border-bottom: 1px solid #e2e8f0;
        }

        .recent-title {
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .recent-location {
          margin-top: 6px;
          color: #64748b;
          font-size: 14px;
        }

        .recent-priority {
          font-weight: 700;
          font-size: 13px;
          color: #475569;
        }

        .status {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .status-active {
          color: #dc2626;
          background: #fee2e2;
        }

        .status-progress {
          color: #d97706;
          background: #fef3c7;
        }

        .status-resolved {
          color: #059669;
          background: #d1fae5;
        }

        .status-other {
          color: #475569;
          background: #e2e8f0;
        }

        .error-message {
          background: #fff1f2;
          color: #b42318;
          padding: 15px;
          border-radius: 9px;
          margin-bottom: 25px;
        }

        .error-message p {
          margin-top: 0;
        }

        .error-message a {
          display: inline-block;
          margin: 0 12px 12px 0;
          color: #067647;
          font-weight: 700;
        }

        .retry-button {
          display: block;
        }

        .loading,
        .empty {
          padding: 40px;
          text-align: center;
          color: #64748b;
        }

        @media (max-width: 1000px) {
          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .two-column {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .reports-page {
            padding: 25px 18px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
          }

          .recent-item {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}