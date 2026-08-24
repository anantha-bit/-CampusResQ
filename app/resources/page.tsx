"use client";

import { useEffect, useState } from "react";

type Resource = {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  quantity: number;
};

export default function ResourcesPage() {

  const [resources, setResources] =
    useState<Resource[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadResources() {

    try {

      setLoading(true);

      const response =
        await fetch("/api/resources", {
          cache: "no-store",
        });

      const data =
        await response.json();

      if (data.success) {
        setResources(data.resources);
      }

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {
    loadResources();
  }, []);

  const total =
    resources.reduce(
      (sum, resource) =>
        sum + resource.quantity,
      0
    );

  const medical =
    resources
      .filter(
        (r) =>
          r.resource_type ===
          "Medical"
      )
      .reduce(
        (sum, r) =>
          sum + r.quantity,
        0
      );

  const fire =
    resources
      .filter(
        (r) =>
          r.resource_type ===
          "Fire Safety"
      )
      .reduce(
        (sum, r) =>
          sum + r.quantity,
        0
      );

  return (

    <div className="page">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          Campus<span>ResQ</span>
        </div>

        <div className="system">
          Campus Emergency Response System
        </div>

        <nav>

          <a href="/">
            Dashboard
          </a>

          <a href="/emergency-reports">
            Emergency Reports
          </a>

          <a
            href="/resources"
            className="selected"
          >
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
          Resources
        </h1>

        <p className="subtitle">
          View and manage emergency response
          resources available on campus.
        </p>


        {/* STATISTICS */}

        <div className="stats">

          <div className="card">

            <span>
              Total Resources
            </span>

            <strong>
              {total}
            </strong>

            <small>
              Available units
            </small>

          </div>


          <div className="card">

            <span>
              Medical
            </span>

            <strong className="green">
              {medical}
            </strong>

            <small className="green">
              Medical resources
            </small>

          </div>


          <div className="card">

            <span>
              Fire Safety
            </span>

            <strong className="red">
              {fire}
            </strong>

            <small className="red">
              Fire safety resources
            </small>

          </div>

        </div>


        {/* RESOURCE LIST */}

        <section className="resources">

          <div className="resource-header">

            <div>

              <h2>
                Available Resources
              </h2>

              <p>
                Resources currently stored
                in the campus emergency system.
              </p>

            </div>

            <button
              onClick={loadResources}
            >
              ↻ Refresh
            </button>

          </div>


          {loading ? (

            <div className="message">
              Loading resources...
            </div>

          ) : (

            <div className="resource-grid">

              {resources.map(
                (resource) => (

                  <div
                    className="resource-card"
                    key={
                      resource.resource_id
                    }
                  >

                    <div className="resource-top">

                      <div>

                        <h3>
                          {resource.resource_name}
                        </h3>

                        <span
                          className={
                            resource.resource_type ===
                            "Medical"
                              ? "type medical"
                              : resource.resource_type ===
                                "Fire Safety"
                              ? "type fire"
                              : "type communication"
                          }
                        >
                          {resource.resource_type}
                        </span>

                      </div>

                      <div className="quantity">

                        <strong>
                          {resource.quantity}
                        </strong>

                        <small>
                          UNITS
                        </small>

                      </div>

                    </div>


                    <div className="bar">

                      <div
                        style={{
                          width: `${Math.min(
                            resource.quantity *
                              5.8,
                            100
                          )}%`,
                        }}
                      />

                    </div>


                    <div className="resource-id">

                      Resource ID: #
                      {resource.resource_id}

                    </div>

                  </div>

                )
              )}

            </div>

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
        }

        .logo span {
          color: #00b981;
        }

        .system {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 35px;
        }

        nav a {
          display: block;
          padding: 14px;
          margin-bottom: 5px;
          border-radius: 8px;
          text-decoration: none;
          color: #28486d;
        }

        nav a:hover,
        nav .selected {
          background: #ecfdf5;
          color: #008f69;
        }

        .hotline {
          margin-top: 45px;
          padding: 18px;
          background: #fff1f2;
          color: #dc2626;
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
          font-size: 34px;
          margin: 0;
        }

        .subtitle {
          color: #58718f;
          font-size: 17px;
          margin-bottom: 30px;
        }

        .stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 35px;
        }

        .card {
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 12px;
          padding: 25px;
        }

        .card span {
          color: #58718f;
        }

        .card strong {
          display: block;
          font-size: 31px;
          margin: 10px 0;
        }

        .card small {
          color: #91a4bf;
        }

        .green {
          color: #00a873 !important;
        }

        .red {
          color: #ef1111 !important;
        }

        .resources {
          background: white;
          border: 1px solid #64748b;
          border-radius: 14px;
          overflow: hidden;
        }

        .resource-header {
          padding: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .resource-header h2 {
          margin: 0;
        }

        .resource-header p {
          color: #58718f;
        }

        .resource-header button {
          padding: 11px 18px;
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .resource-grid {
          border-top: 1px solid #cbd5e1;
          padding: 25px;
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 20px;
        }

        .resource-card {
          border: 1px solid #94a3b8;
          border-radius: 12px;
          padding: 22px;
        }

        .resource-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .resource-card h3 {
          margin: 0 0 10px;
          font-size: 20px;
        }

        .type {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .medical {
          background: #ecfdf5;
          color: #008f69;
        }

        .fire {
          background: #fff1f2;
          color: #dc2626;
        }

        .communication {
          background: #eff6ff;
          color: #2563eb;
        }

        .quantity {
          background: #020617;
          color: white;
          border-radius: 9px;
          width: 68px;
          height: 78px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .quantity strong {
          font-size: 25px;
        }

        .quantity small {
          color: #94a3b8;
          font-size: 10px;
        }

        .bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 10px;
          margin-top: 25px;
          overflow: hidden;
        }

        .bar div {
          height: 100%;
          background: #00b981;
          border-radius: 10px;
        }

        .resource-id {
          margin-top: 15px;
          color: #7186a3;
          font-size: 13px;
        }

        .message {
          padding: 40px;
          text-align: center;
          color: #64748b;
        }

        @media(max-width:900px) {

          .stats {
            grid-template-columns: 1fr;
          }

          .resource-grid {
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

          .resource-grid {
            grid-template-columns: 1fr;
          }

        }

      `}</style>

    </div>
  );
}