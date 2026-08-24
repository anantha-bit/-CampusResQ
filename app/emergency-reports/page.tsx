"use client";

import { useEffect, useState } from "react";

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
  floor: string;
  room: string;
};

export default function EmergencyReportsPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");

  async function loadEmergencies() {
    try {
      setLoading(true);

      const response = await fetch("/api/emergencies", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setEmergencies(data.emergencies);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmergencies();
  }, []);

  const filteredEmergencies = emergencies.filter((emergency) => {
    const text = search.toLowerCase();

    const matchesSearch =
      emergency.emergency_type
        .toLowerCase()
        .includes(text) ||
      emergency.description
        .toLowerCase()
        .includes(text) ||
      emergency.building
        .toLowerCase()
        .includes(text) ||
      emergency.room
        .toLowerCase()
        .includes(text);

    const matchesStatus =
      status === "ALL" ||
      emergency.status === status;

    const matchesPriority =
      priority === "ALL" ||
      emergency.priority === priority;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  function priorityClass(priority: string) {
    if (priority === "CRITICAL")
      return "critical";

    if (priority === "HIGH")
      return "high";

    if (priority === "MEDIUM")
      return "medium";

    return "low";
  }

  function statusClass(status: string) {
    if (status === "ACTIVE")
      return "active";

    if (status === "IN_PROGRESS")
      return "progress";

    if (status === "RESOLVED")
      return "resolved";

    return "";
  }

  function displayStatus(status: string) {
    return status.replace("_", " ");
  }

  async function updateStatus(
    emergencyId: number,
    newStatus: string
  ) {
    try {
      const response = await fetch(
        "/api/emergencies",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emergency_id: emergencyId,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        loadEmergencies();
      } else {
        alert(
          data.message ||
            "Failed to update status"
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        "Failed to update emergency status."
      );
    }
  }

  const activeCount = emergencies.filter(
    (e) => e.status === "ACTIVE"
  ).length;

  const progressCount = emergencies.filter(
    (e) => e.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = emergencies.filter(
    (e) => e.status === "RESOLVED"
  ).length;

  return (
    <div className="page">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          Campus<span>ResQ</span>
        </div>

        <div className="system-name">
          Campus Emergency Response System
        </div>

        <nav>

          <a href="/">
            Dashboard
          </a>

          <a
            href="/emergency-reports"
            className="selected"
          >
            Emergency Reports
          </a>

          <a href="/resources">
            Resources
          </a>

          <a href="/locations">
            Locations
          </a>

          <a href="/reports">
            Reports & Analytics
          </a>

        </nav>

        <div className="hotline">
          <strong>
            Emergency Hotline
          </strong>

          <div>112</div>

          <span>
            For immediate assistance
          </span>
        </div>

      </aside>


      {/* MAIN */}

      <main>

        <h1>
          Emergency Reports
        </h1>

        <p className="subtitle">
          Monitor and manage campus emergency
          response activities.
        </p>


        {/* STATISTICS */}

        <div className="stats">

          <div className="card">
            <span>Total Incidents</span>
            <strong>
              {emergencies.length}
            </strong>
            <small>
              Recorded emergencies
            </small>
          </div>

          <div className="card">
            <span>Active</span>
            <strong className="red">
              {activeCount}
            </strong>
            <small className="red">
              Requires attention
            </small>
          </div>

          <div className="card">
            <span>In Progress</span>
            <strong className="orange">
              {progressCount}
            </strong>
            <small className="orange">
              Response teams assigned
            </small>
          </div>

          <div className="card">
            <span>Resolved</span>
            <strong className="green">
              {resolvedCount}
            </strong>
            <small className="green">
              Successfully handled
            </small>
          </div>

        </div>


        {/* FILTER SECTION */}

        <section className="reports">

          <div className="reports-header">

            <div>
              <h2>
                Emergency Reports
              </h2>

              <p>
                Search and filter reported
                emergencies.
              </p>
            </div>

            <button
              onClick={loadEmergencies}
            >
              ↻ Refresh
            </button>

          </div>


          <div className="filters">

            <input
              type="text"
              placeholder="Search emergencies..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="IN_PROGRESS">
                In Progress
              </option>

              <option value="RESOLVED">
                Resolved
              </option>

            </select>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
            >
              <option value="ALL">
                All Priorities
              </option>

              <option value="CRITICAL">
                Critical
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="LOW">
                Low
              </option>

            </select>

          </div>


          {/* REPORTS */}

          <div className="report-heading">

            <h2>Reports</h2>

            <p>
              Showing{" "}
              {filteredEmergencies.length} of{" "}
              {emergencies.length} incidents
            </p>

          </div>


          {loading ? (

            <div className="message">
              Loading emergencies...
            </div>

          ) : filteredEmergencies.length === 0 ? (

            <div className="message">
              No emergencies found.
            </div>

          ) : (

            filteredEmergencies.map(
              (emergency) => (

                <div
                  className="emergency"
                  key={
                    emergency.emergency_id
                  }
                >

                  <div className="emergency-top">

                    <div className="title">

                      <h3>
                        {emergency.emergency_type}
                      </h3>

                      <span
                        className={`badge ${priorityClass(
                          emergency.priority
                        )}`}
                      >
                        {emergency.priority}
                      </span>

                      <span
                        className={`badge ${statusClass(
                          emergency.status
                        )}`}
                      >
                        {displayStatus(
                          emergency.status
                        )}
                      </span>

                    </div>


                    <div>

                      {emergency.status ===
                        "ACTIVE" && (

                        <button
                          className="start"
                          onClick={() =>
                            updateStatus(
                              emergency.emergency_id,
                              "IN_PROGRESS"
                            )
                          }
                        >
                          Start Response
                        </button>

                      )}

                      {emergency.status ===
                        "IN_PROGRESS" && (

                        <button
                          className="resolve"
                          onClick={() =>
                            updateStatus(
                              emergency.emergency_id,
                              "RESOLVED"
                            )
                          }
                        >
                          Mark Resolved
                        </button>

                      )}

                      {emergency.status ===
                        "RESOLVED" && (

                        <span className="handled">
                          ✓ Successfully handled
                        </span>

                      )}

                    </div>

                  </div>


                  <div className="details">

                    <div>
                      <b>Location:</b>{" "}
                      {emergency.building} •{" "}
                      {emergency.room}
                    </div>

                    <div>
                      <b>Floor:</b>{" "}
                      {emergency.floor}
                    </div>

                    <div>
                      <b>Incident ID:</b>{" "}
                      #{emergency.emergency_id}
                    </div>

                    <div>
                      <b>Reported by:</b>{" "}
                      User #{emergency.reported_by}
                    </div>

                  </div>


                  <div className="description">

                    <strong>
                      DESCRIPTION
                    </strong>

                    <p>
                      {emergency.description}
                    </p>

                  </div>


                  <div className="date">
                    Reported{" "}
                    {new Date(
                      emergency.created_at
                    ).toLocaleString("en-IN")}
                  </div>

                </div>

              )
            )

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
          grid-template-columns:
            repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 30px;
        }

        .card {
          background: white;
          border: 1px solid #94a3b8;
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
          border: 1px solid #64748b;
          border-radius: 14px;
          overflow: hidden;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .reports-header button {
          padding: 11px 18px;
          border: 1px solid #94a3b8;
          background: white;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .filters {
          display: grid;
          grid-template-columns:
            1fr 1fr 1fr;
          gap: 12px;
          padding: 0 25px 25px;
        }

        .filters input,
        .filters select {
          height: 52px;
          border: 1px solid #94a3b8;
          border-radius: 8px;
          padding: 0 15px;
          font-size: 16px;
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
          padding: 40px;
          text-align: center;
          color: #64748b;
        }

        @media(max-width:900px) {
          .stats {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media(max-width:650px) {
          .sidebar {
            position: static;
            width: 100%;
          }

          main {
            margin-left: 0;
          }

          .stats,
          .filters,
          .details {
            grid-template-columns: 1fr;
          }

          .emergency-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
        }

      `}</style>

    </div>
  );
}