"use client";

import { useEffect, useMemo, useState } from "react";

type Location = {
  location_id: number;
  building: string;
  floor: string;
  room: string;
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState("");
  const [building, setBuilding] = useState("All Buildings");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLocations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/locations");

      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch locations");
      }

      setLocations(data.locations || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLocations();
  }, []);

  const buildings = useMemo(() => {
    return [
      "All Buildings",
      ...Array.from(new Set(locations.map((location) => location.building))),
    ];
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        location.building.toLowerCase().includes(searchText) ||
        location.floor.toLowerCase().includes(searchText) ||
        location.room.toLowerCase().includes(searchText);

      const matchesBuilding =
        building === "All Buildings" ||
        location.building === building;

      return matchesSearch && matchesBuilding;
    });
  }, [locations, search, building]);

  return (
    <div className="locations-page">
      <div className="page-header">
        <h1>Locations</h1>
        <p>
          View and manage emergency response locations available on campus.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-title">Total Locations</div>
          <div className="summary-number">{locations.length}</div>
          <div className="summary-text">
            Registered campus locations
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">Buildings</div>
          <div className="summary-number green">
            {Math.max(buildings.length - 1, 0)}
          </div>
          <div className="summary-text">
            Campus buildings
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">Floors</div>
          <div className="summary-number orange">
            {new Set(locations.map((location) => location.floor)).size}
          </div>
          <div className="summary-text">
            Registered floors
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div className="locations-container">
        <div className="locations-header">
          <div>
            <h2>Campus Locations</h2>
            <p>
              Locations currently stored in the campus emergency system.
            </p>
          </div>

          <button className="refresh-button" onClick={loadLocations}>
            ↻ Refresh
          </button>
        </div>

        {/* Search / Filter */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
          >
            {buildings.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading locations...</div>
        ) : (
          <>
            <div className="results-header">
              <h2>Locations</h2>
              <span>
                Showing {filteredLocations.length} of {locations.length} locations
              </span>
            </div>

            <div className="location-grid">
              {filteredLocations.map((location) => (
                <div className="location-card" key={location.location_id}>
                  <div className="location-card-top">
                    <div>
                      <h3>{location.room}</h3>

                      <span className="location-badge">
                        {location.building}
                      </span>
                    </div>

                    <div className="location-icon">
                      📍
                    </div>
                  </div>

                  <div className="location-details">
                    <div>
                      <span>LOCATION ID</span>
                      <strong>#{location.location_id}</strong>
                    </div>

                    <div>
                      <span>BUILDING</span>
                      <strong>{location.building}</strong>
                    </div>

                    <div>
                      <span>FLOOR</span>
                      <strong>{location.floor}</strong>
                    </div>

                    <div>
                      <span>ROOM / AREA</span>
                      <strong>{location.room}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredLocations.length === 0 && (
              <div className="no-results">
                No locations found.
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .locations-page {
          min-height: 100vh;
          background: #f1f5f9;
          padding: 36px 42px 60px;
          color: #111827;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 700;
          color: #0f172a;
        }

        .page-header p {
          margin: 8px 0 0;
          font-size: 17px;
          color: #64748b;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 36px;
        }

        .summary-card {
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.08);
        }

        .summary-title {
          color: #64748b;
          font-size: 16px;
          margin-bottom: 10px;
        }

        .summary-number {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
        }

        .summary-number.green {
          color: #00a878;
        }

        .summary-number.orange {
          color: #e87500;
        }

        .summary-text {
          margin-top: 8px;
          color: #94a3b8;
          font-size: 14px;
        }

        .locations-container {
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.06);
        }

        .locations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 26px 28px;
        }

        .locations-header h2 {
          margin: 0;
          font-size: 24px;
          color: #0f172a;
        }

        .locations-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 15px;
        }

        .refresh-button {
          background: white;
          border: 1px solid #94a3b8;
          border-radius: 9px;
          padding: 11px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          color: #0f172a;
        }

        .refresh-button:hover {
          background: #f8fafc;
        }

        .filters {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 14px;
          padding: 0 28px 25px;
        }

        .filters input,
        .filters select {
          height: 50px;
          border: 1px solid #94a3b8;
          border-radius: 9px;
          padding: 0 16px;
          font-size: 16px;
          color: #0f172a;
          background: white;
          outline: none;
        }

        .filters input:focus,
        .filters select:focus {
          border-color: #00a878;
        }

        .error-message {
          margin: 0 28px 20px;
          padding: 15px;
          background: #fff1f2;
          color: #dc2626;
          border-radius: 8px;
        }

        .loading {
          padding: 50px;
          text-align: center;
          color: #64748b;
        }

        .results-header {
          border-top: 1px solid #cbd5e1;
          padding: 25px 28px;
        }

        .results-header h2 {
          margin: 0;
          font-size: 22px;
        }

        .results-header span {
          display: block;
          margin-top: 7px;
          color: #64748b;
        }

        .location-grid {
          border-top: 1px solid #cbd5e1;
          padding: 26px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .location-card {
          border: 1px solid #94a3b8;
          border-radius: 12px;
          padding: 20px;
          background: white;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.06);
        }

        .location-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .location-card h3 {
          margin: 0 0 10px;
          font-size: 20px;
          color: #0f172a;
        }

        .location-badge {
          display: inline-block;
          padding: 6px 12px;
          background: #ecfdf5;
          color: #008f68;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .location-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 9px;
          font-size: 20px;
        }

        .location-details {
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .location-details div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .location-details span {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
        }

        .location-details strong {
          color: #475569;
          font-size: 14px;
        }

        .no-results {
          padding: 50px;
          text-align: center;
          color: #64748b;
          border-top: 1px solid #cbd5e1;
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          .location-grid {
            grid-template-columns: 1fr;
          }

          .filters {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}