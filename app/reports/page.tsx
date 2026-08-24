"use client";

import { useEffect, useMemo, useState } from "react";

type Emergency = {
  emergency_id: number;
  emergency_type: string;
  priority: string;
  status: string;
  description: string;
  building: string;
  floor: string;
  room: string;
  created_at: string;
};

export default function ReportsPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEmergencies() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/emergencies");

      if (!response.ok) {
        throw new Error("Failed to fetch emergencies");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch emergencies");
      }

      setEmergencies(data.emergencies || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmergencies();
  }, []);

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
      stats[item.emergency_type] =
        (stats[item.emergency_type] || 0) + 1;
    });

    return stats;
  }, [emergencies]);

  const priorityStats = useMemo(() => {
    const stats: Record<string, number> = {};

    emergencies.forEach((item) => {
      stats[item.priority] =
        (stats[item.priority] || 0) + 1;
    });

    return stats;
  }, [emergencies]);

  const locationStats = useMemo(() => {
    const stats: Record<string, number> = {};

    emergencies.forEach((item) => {
      const location = `${item.building} • ${item.room}`;

      stats[location] =
        (stats[location] || 0) + 1;
    });

    return stats;
  }, [emergencies]);

  function percentage(value: number) {
    if (statistics.total === 0) return 0;

    return Math.round(
      (value / statistics.total) * 100
    );
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>
            Analyze campus emergency response activities and incidents.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadEmergencies}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="loading">
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-title">
                Total Incidents
              </div>

              <div className="card-number">
                {statistics.total}
              </div>

              <div className="card-description">
                All recorded emergencies
              </div>
            </div>

            <div className="summary-card">
              <div className="card-title">
                Active
              </div>

              <div className="card-number red">
                {statistics.active}
              </div>

              <div className="card-description red-text">
                Requires attention
              </div>
            </div>

            <div className="summary-card">
              <div className="card-title">
                In Progress
              </div>

              <div className="card-number orange">
                {statistics.inProgress}
              </div>

              <div className="card-description orange-text">
                Response teams assigned
              </div>
            </div>

            <div className="summary-card">
              <div className="card-title">
                Resolved
              </div>

              <div className="card-number green">
                {statistics.resolved}
              </div>

              <div className="card-description green-text">
                Successfully handled
              </div>
            </div>
          </div>

          {/* Response Overview */}
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
                  <strong>
                    {statistics.active}
                  </strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-red"
                    style={{
                      width: `${percentage(
                        statistics.active
                      )}%`,
                    }}
                  />
                </div>

                <small>
                  {percentage(statistics.active)}%
                  of total incidents
                </small>
              </div>

              <div className="overview-item">
                <div className="overview-top">
                  <span>In Progress</span>
                  <strong>
                    {statistics.inProgress}
                  </strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-orange"
                    style={{
                      width: `${percentage(
                        statistics.inProgress
                      )}%`,
                    }}
                  />
                </div>

                <small>
                  {percentage(statistics.inProgress)}%
                  of total incidents
                </small>
              </div>

              <div className="overview-item">
                <div className="overview-top">
                  <span>Resolved</span>
                  <strong>
                    {statistics.resolved}
                  </strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-green"
                    style={{
                      width: `${percentage(
                        statistics.resolved
                      )}%`,
                    }}
                  />
                </div>

                <small>
                  {percentage(statistics.resolved)}%
                  of total incidents
                </small>
              </div>
            </div>
          </div>

          {/* Type + Priority */}
          <div className="two-column">
            {/* Emergency Types */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h2>Emergencies by Type</h2>
                  <p>
                    Distribution of emergency categories.
                  </p>
                </div>
              </div>

              <div className="stats-list">
                {Object.keys(typeStats).length === 0 ? (
                  <div className="empty">
                    No emergency data available.
                  </div>
                ) : (
                  Object.entries(typeStats).map(
                    ([type, count]) => (
                      <div
                        className="stat-row"
                        key={type}
                      >
                        <div className="stat-label">
                          <span className="dot green-dot" />
                          <span>{type}</span>
                        </div>

                        <div className="stat-value">
                          {count}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h2>Emergencies by Priority</h2>
                  <p>
                    Incidents grouped by priority level.
                  </p>
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
                      <div
                        className="stat-row"
                        key={priority}
                      >
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

                        <div className="stat-value">
                          {count}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>

          {/* Location Analysis */}
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
                    <div
                      className="table-row"
                      key={location}
                    >
                      <span>{location}</span>

                      <strong>
                        {count}
                      </strong>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Recent Incidents */}
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
              {emergencies.slice(0, 5).map(
                (incident) => (
                  <div
                    className="recent-item"
                    key={incident.emergency_id}
                  >
                    <div>
                      <div className="recent-title">
                        {incident.emergency_type}

                        <span
                          className={`status ${
                            incident.status === "ACTIVE"
                              ? "status-active"
                              : incident.status ===
                                "IN_PROGRESS"
                              ? "status-progress"
                              : "status-resolved"
                          }`}
                        >
                          {incident.status.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </div>

                      <div className="recent-location">
                        {incident.building} •{" "}
                        {incident.room}
                      </div>
                    </div>

                    <div className="recent-priority">
                      {incident.priority}
                    </div>
                  </div>
                )
              )}

              {emergencies.length === 0 && (
                <div className="empty">
                  No incidents recorded.
                </div>
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

        .refresh-button {
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 9px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        .refresh-button:hover {
          background: #f8fafc;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 2px 5px
            rgba(15, 23, 42, 0.06);
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

        .card-number.red {
          color: #ef1111;
        }

        .card-number.orange {
          color: #e87500;
        }

        .card-number.green {
          color: #00a878;
        }

        .card-description {
          margin-top: 8px;
          color: #94a3b8;
          font-size: 14px;
        }

        .red-text {
          color: #ef1111;
        }

        .orange-text {
          color: #e87500;
        }

        .green-text {
          color: #00a878;
        }

        .section-card {
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 14px;
          margin-bottom: 25px;
          overflow: hidden;
          box-shadow: 0 2px 5px
            rgba(15, 23, 42, 0.05);
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
          grid-template-columns: repeat(3, 1fr);
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
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .two-column .section-card {
          margin-bottom: 25px;
        }

        .stats-list {
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

        .location-table {
          border-top: 1px solid #cbd5e1;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 1fr 150px;
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

        .recent-list {
          border-top: 1px solid #cbd5e1;
        }

        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 28px;
          border-bottom: 1px solid #e2e8f0;
        }

        .recent-title {
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
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

        .error-message {
          background: #fff1f2;
          color: #dc2626;
          padding: 15px;
          border-radius: 9px;
          margin-bottom: 25px;
        }

        .loading,
        .empty {
          padding: 40px;
          text-align: center;
          color: #64748b;
        }

        @media (max-width: 1000px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
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
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
}