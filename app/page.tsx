"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function Dashboard() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    emergency_type: "Medical",
    priority: "HIGH",
    building: "Block A",
    floor: "2nd Floor",
    room: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // FETCH EMERGENCIES
  // --------------------------------------------------

  async function fetchEmergencies() {
    try {
      setLoading(true);

      const response = await fetch("/api/emergencies", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setEmergencies(data.emergencies);
      } else {
        setError("Failed to load emergencies.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load emergencies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmergencies();
  }, []);

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------

  const totalIncidents = emergencies.length;

  const activeCount = emergencies.filter(
    (e) => e.status === "ACTIVE"
  ).length;

  const inProgressCount = emergencies.filter(
    (e) => e.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = emergencies.filter(
    (e) => e.status === "RESOLVED"
  ).length;

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredEmergencies = useMemo(() => {
    return emergencies.filter((emergency) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        emergency.emergency_type
          ?.toLowerCase()
          .includes(searchText) ||
        emergency.description
          ?.toLowerCase()
          .includes(searchText) ||
        emergency.building
          ?.toLowerCase()
          .includes(searchText) ||
        emergency.room
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        emergency.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        emergency.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    emergencies,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // --------------------------------------------------
  // SUBMIT EMERGENCY
  // --------------------------------------------------

  async function submitEmergency() {
    setError("");
    setSuccess("");

    if (
      !form.emergency_type ||
      !form.priority ||
      !form.building ||
      !form.floor ||
      !form.room ||
      !form.description
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      // First find/create the location.
      const locationResponse = await fetch(
        "/api/locations",
        {
          cache: "no-store",
        }
      );

      const locationData =
        await locationResponse.json();

      if (!locationData.success) {
        setError("Failed to load locations.");
        return;
      }

      const location = locationData.locations.find(
        (item: any) =>
          item.building === form.building &&
          item.floor === form.floor &&
          item.room === form.room
      );

      if (!location) {
        setError(
          "This location does not exist. Please use a registered campus location."
        );
        return;
      }

      const response = await fetch(
        "/api/emergencies",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reported_by: 1,
            location_id: location.location_id,
            emergency_type:
              form.emergency_type,
            priority: form.priority,
            description: form.description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Failed to report emergency."
        );
        return;
      }

      setSuccess(
        "Emergency reported successfully."
      );

      setForm({
        emergency_type: "Medical",
        priority: "HIGH",
        building: "Block A",
        floor: "2nd Floor",
        room: "",
        description: "",
      });

      setShowModal(false);

      await fetchEmergencies();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to report emergency."
      );
    }
  }

  // --------------------------------------------------
  // UPDATE STATUS
  // --------------------------------------------------

  async function updateStatus(
    emergencyId: number,
    status: string
  ) {
    setError("");

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
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Failed to update emergency status."
        );
        return;
      }

      await fetchEmergencies();
    } catch (err) {
      console.error(err);
      setError(
        "Failed to update emergency status."
      );
    }
  }

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function getPriorityClass(priority: string) {
    switch (priority) {
      case "CRITICAL":
        return "badge critical";

      case "HIGH":
        return "badge high";

      case "MEDIUM":
        return "badge medium";

      case "LOW":
        return "badge low";

      default:
        return "badge";
    }
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "ACTIVE":
        return "badge active";

      case "IN_PROGRESS":
        return "badge progress";

      case "RESOLVED":
        return "badge resolved";

      default:
        return "badge";
    }
  }

  function formatStatus(status: string) {
    return status.replace("_", " ");
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="dashboard-layout">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="top-header">

        <div>
          <div className="brand">
            Campus<span>ResQ</span>
          </div>

          <div className="subtitle">
            Campus Emergency Response System
          </div>
        </div>

        <div className="admin-section">
          <div>
            <strong>Akash</strong>
            <small>Administrator</small>
          </div>

          <div className="avatar">
            A
          </div>
        </div>

      </header>


      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="sidebar">

        <a
          href="/"
          className="nav-item active-nav"
        >
          Dashboard
        </a>

        <a
          href="/emergency-reports"
          className="nav-item"
        >
          Emergency Reports
        </a>

        <a
          href="/resources"
          className="nav-item"
        >
          Resources
        </a>

        <a
          href="/locations"
          className="nav-item"
        >
          Locations
        </a>

        <a
          href="/reports"
          className="nav-item"
        >
          Reports & Analytics
        </a>


        <div className="hotline">

          <strong>
            Emergency Hotline
          </strong>

          <div className="hotline-number">
            112
          </div>

          <span>
            For immediate assistance
          </span>

        </div>

      </aside>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="main-content">

        <h1>Dashboard</h1>

        <p className="page-description">
          Monitor and manage campus emergency
          response activities.
        </p>


        {/* ==================================================
            SUCCESS / ERROR
        ================================================== */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}


        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-title">
              Total Incidents
            </div>

            <div className="stat-number">
              {totalIncidents}
            </div>

            <div className="stat-description">
              Recorded emergencies
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-title">
              Active
            </div>

            <div className="stat-number red">
              {activeCount}
            </div>

            <div className="stat-description red-text">
              Requires attention
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-title">
              In Progress
            </div>

            <div className="stat-number orange">
              {inProgressCount}
            </div>

            <div className="stat-description orange-text">
              Response teams assigned
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-title">
              Resolved
            </div>

            <div className="stat-number green">
              {resolvedCount}
            </div>

            <div className="stat-description green-text">
              Successfully handled
            </div>

          </div>

        </div>


        {/* ==================================================
            REPORT EMERGENCY BANNER
        ================================================== */}

        <div className="emergency-banner">

          <div>

            <h2>
              Report an Emergency
            </h2>

            <p>
              Quickly report a medical, fire,
              security, or other emergency.
            </p>

          </div>

          <button
            className="report-button"
            onClick={() => {
              setError("");
              setShowModal(true);
            }}
          >
            + Report Emergency
          </button>

        </div>


        {/* ==================================================
            REPORTS
        ================================================== */}

        <section className="reports-container">

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
              className="refresh-button"
              onClick={fetchEmergencies}
            >
              ↻ Refresh
            </button>

          </div>


          {/* FILTERS */}

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
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
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
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
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


          {/* REPORT TITLE */}

          <div className="reports-title">

            <h2>
              Reports
            </h2>

            <p>
              Showing{" "}
              {filteredEmergencies.length} of{" "}
              {emergencies.length} incidents
            </p>

          </div>


          {/* REPORT LIST */}

          {loading ? (

            <div className="loading">
              Loading emergencies...
            </div>

          ) : filteredEmergencies.length === 0 ? (

            <div className="empty">
              No emergencies found.
            </div>

          ) : (

            <div>

              {filteredEmergencies.map(
                (emergency) => (

                  <div
                    key={
                      emergency.emergency_id
                    }
                    className="report-card"
                  >

                    <div className="report-top">

                      <div className="report-title">

                        <h3>
                          {emergency.emergency_type}
                        </h3>

                        <span
                          className={getPriorityClass(
                            emergency.priority
                          )}
                        >
                          {emergency.priority}
                        </span>

                        <span
                          className={getStatusClass(
                            emergency.status
                          )}
                        >
                          {formatStatus(
                            emergency.status
                          )}
                        </span>

                      </div>


                      {/* ACTION */}

                      <div>

                        {emergency.status ===
                          "ACTIVE" && (

                          <button
                            className="start-button"
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
                            className="resolve-button"
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


                    {/* LOCATION */}

                    <div className="details-grid">

                      <div>
                        <strong>
                          Location:
                        </strong>{" "}
                        {emergency.building} •{" "}
                        {emergency.room}
                      </div>

                      <div>
                        <strong>
                          Floor:
                        </strong>{" "}
                        {emergency.floor}
                      </div>

                      <div>
                        <strong>
                          Incident ID:
                        </strong>{" "}
                        #{emergency.emergency_id}
                      </div>

                      <div>
                        <strong>
                          Reported by:
                        </strong>{" "}
                        User #{emergency.reported_by}
                      </div>

                    </div>


                    {/* DESCRIPTION */}

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
              )}

            </div>

          )}

        </section>

      </main>


      {/* ==================================================
          EMERGENCY MODAL
      ================================================== */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>

                <h2>
                  Report an Emergency
                </h2>

                <p>
                  Enter the emergency details
                  below.
                </p>

              </div>

              <button
                className="close-button"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Emergency Type
                </label>

                <select
                  value={form.emergency_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emergency_type:
                        e.target.value,
                    })
                  }
                >
                  <option>
                    Medical
                  </option>

                  <option>
                    Fire
                  </option>

                  <option>
                    Security
                  </option>

                  <option>
                    Other
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  Priority
                </label>

                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority:
                        e.target.value,
                    })
                  }
                >
                  <option>
                    CRITICAL
                  </option>

                  <option>
                    HIGH
                  </option>

                  <option>
                    MEDIUM
                  </option>

                  <option>
                    LOW
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  Building
                </label>

                <input
                  value={form.building}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      building:
                        e.target.value,
                    })
                  }
                  placeholder="Block A"
                />

              </div>


              <div className="form-group">

                <label>
                  Floor
                </label>

                <input
                  value={form.floor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      floor:
                        e.target.value,
                    })
                  }
                  placeholder="2nd Floor"
                />

              </div>


              <div className="form-group full">

                <label>
                  Room / Location
                </label>

                <input
                  value={form.room}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      room:
                        e.target.value,
                    })
                  }
                  placeholder="Room 204"
                />

              </div>


              <div className="form-group full">

                <label>
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Describe the emergency..."
                  rows={5}
                />

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="modal-error">
                {error}
              </div>

            )}


            {/* BUTTONS */}

            <div className="modal-actions">

              <button
                className="cancel-button"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="submit-button"
                onClick={submitEmergency}
              >
                Submit Emergency
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          CSS
      ================================================== */}

      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          background: #f1f5f9;
          color: #111827;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        .dashboard-layout {
          min-height: 100vh;
          background: #f1f5f9;
        }

        /* HEADER */

        .top-header {
          height: 70px;
          background: #020617;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 6%;
          box-shadow:
            0 2px 8px
            rgba(0,0,0,.15);
        }

        .brand {
          font-size: 24px;
          font-weight: 700;
        }

        .brand span {
          color: #00c389;
        }

        .subtitle {
          color: #8da2c0;
          font-size: 14px;
          margin-top: 2px;
        }

        .admin-section {
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: right;
        }

        .admin-section small {
          display: block;
          color: #8da2c0;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #00c389;
          color: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
        }

        /* SIDEBAR */

        .sidebar {
          position: fixed;
          top: 70px;
          left: 0;
          bottom: 0;
          width: 250px;
          background: white;
          border-right: 1px solid #64748b;
          padding: 20px 16px;
        }

        .nav-item {
          display: block;
          padding: 14px 16px;
          margin-bottom: 5px;
          border-radius: 9px;
          color: #27466b;
          font-size: 15px;
        }

        .nav-item:hover {
          background: #ecfdf5;
          color: #008f69;
        }

        .active-nav {
          background: #ecfdf5;
          color: #008f69;
        }

        .hotline {
          margin-top: 45px;
          padding: 18px;
          border-radius: 12px;
          background: #fff1f2;
          color: #dc2626;
        }

        .hotline-number {
          font-size: 28px;
          font-weight: 700;
          margin: 8px 0;
        }

        .hotline span {
          font-size: 13px;
        }

        /* MAIN */

        .main-content {
          margin-left: 250px;
          padding: 30px 5%;
          min-height: calc(100vh - 70px);
        }

        h1 {
          font-size: 32px;
          margin: 0;
        }

        .page-description {
          color: #58718f;
          font-size: 17px;
          margin-top: 8px;
          margin-bottom: 32px;
        }

        /* ERROR */

        .error-message {
          background: #fff1f2;
          color: #dc2626;
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .success-message {
          background: #ecfdf5;
          color: #008f69;
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        /* STATS */

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border: 1px solid #64748b;
          border-radius: 14px;
          padding: 24px;
          box-shadow:
            0 2px 5px
            rgba(15,23,42,.08);
        }

        .stat-title {
          color: #58718f;
          font-size: 15px;
        }

        .stat-number {
          font-size: 31px;
          font-weight: 700;
          margin: 8px 0;
        }

        .stat-description {
          color: #91a4bf;
          font-size: 13px;
        }

        .red {
          color: #ef1111;
        }

        .orange {
          color: #f28c00;
        }

        .green {
          color: #00a873;
        }

        .red-text {
          color: #ef1111;
        }

        .orange-text {
          color: #f28c00;
        }

        .green-text {
          color: #00a873;
        }

        /* BANNER */

        .emergency-banner {
          background: #020617;
          color: white;
          border-radius: 14px;
          padding: 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .emergency-banner h2 {
          margin: 0 0 6px;
          font-size: 21px;
        }

        .emergency-banner p {
          margin: 0;
          color: #9ab0ce;
        }

        .report-button {
          border: none;
          background: #ef0505;
          color: white;
          font-size: 16px;
          font-weight: 700;
          padding: 16px 25px;
          border-radius: 9px;
          cursor: pointer;
        }

        .report-button:hover {
          background: #d90000;
        }

        /* REPORTS */

        .reports-container {
          background: white;
          border: 1px solid #64748b;
          border-radius: 14px;
          overflow: hidden;
        }

        .reports-header {
          padding: 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .reports-header h2 {
          margin: 0;
          font-size: 22px;
        }

        .reports-header p {
          margin: 6px 0 0;
          color: #58718f;
        }

        .refresh-button {
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 8px;
          padding: 11px 18px;
          cursor: pointer;
          font-weight: 600;
        }

        .filters {
          display: grid;
          grid-template-columns:
            1fr 1fr 1fr;
          gap: 12px;
          padding: 0 25px 20px;
        }

        .filters input,
        .filters select {
          height: 52px;
          border: 1px solid #94a3b8;
          border-radius: 8px;
          padding: 0 16px;
          font-size: 16px;
          background: white;
        }

        .reports-title {
          border-top: 1px solid #cbd5e1;
          padding: 22px 25px;
        }

        .reports-title h2 {
          margin: 0;
        }

        .reports-title p {
          margin: 7px 0 0;
          color: #58718f;
        }

        .report-card {
          border-top: 1px solid #cbd5e1;
          padding: 28px 25px;
        }

        .report-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .report-title {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .report-title h3 {
          margin: 0;
          font-size: 20px;
        }

        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .badge.high {
          background: #fff0d6;
          color: #ed7c00;
        }

        .badge.critical {
          background: #fee2e2;
          color: #dc2626;
        }

        .badge.medium {
          background: #dbeafe;
          color: #2563eb;
        }

        .badge.low {
          background: #e2e8f0;
          color: #475569;
        }

        .badge.active {
          background: #ffe0e0;
          color: #dc2626;
        }

        .badge.progress {
          background: #fff0bd;
          color: #d97706;
        }

        .badge.resolved {
          background: #d1fae5;
          color: #008f69;
        }

        .start-button {
          background: #ff9d00;
          border: none;
          color: white;
          padding: 12px 18px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .resolve-button {
          background: #00a873;
          border: none;
          color: white;
          padding: 12px 18px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .handled {
          background: #ecfdf5;
          color: #008f69;
          padding: 10px 15px;
          border-radius: 8px;
          font-weight: 700;
        }

        .details-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 16px;
          margin-top: 22px;
          color: #506b8b;
        }

        .description {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .description strong {
          color: #8da0bb;
          font-size: 12px;
        }

        .description p {
          margin: 8px 0 0;
        }

        .date {
          margin-top: 14px;
          color: #8da0bb;
          font-size: 13px;
        }

        .loading,
        .empty {
          padding: 35px;
          text-align: center;
          color: #64748b;
          border-top: 1px solid #cbd5e1;
        }

        /* MODAL */

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.58);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .modal {
          width: 820px;
          max-width: 100%;
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 18px;
          padding: 30px;
          box-shadow:
            0 20px 60px
            rgba(0,0,0,.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .modal-header h2 {
          font-size: 30px;
          margin: 0;
        }

        .modal-header p {
          color: #58718f;
          margin: 8px 0 0;
          font-size: 17px;
        }

        .close-button {
          border: none;
          background: transparent;
          font-size: 34px;
          color: #94a3b8;
          cursor: pointer;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 15px;
          font-weight: 700;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          border: 1px solid #64748b;
          border-radius: 8px;
          padding: 14px;
          font-size: 16px;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .modal-error {
          background: #fff1f2;
          color: #dc2626;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 25px;
        }

        .cancel-button {
          background: white;
          border: 1px solid #64748b;
          padding: 13px 25px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .submit-button {
          background: #ef0505;
          color: white;
          border: none;
          padding: 13px 25px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {

          .sidebar {
            width: 200px;
          }

          .main-content {
            margin-left: 200px;
          }

          .stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 650px) {

          .top-header {
            padding: 0 15px;
          }

          .sidebar {
            position: static;
            width: 100%;
            height: auto;
          }

          .main-content {
            margin-left: 0;
            padding: 20px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }

          .emergency-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .report-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

        }

      `}</style>

    </div>
  );
}