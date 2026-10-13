"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CampusLocation {
  location_id: number;
  building: string;
  floor: string;
  room: string;
}

export default function ReportEmergencyPage() {
  const router = useRouter();

  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [emergencyType, setEmergencyType] = useState("Medical");
  const [locationId, setLocationId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadLocations() {
      try {
        const response = await fetch("/api/locations", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load locations.");
        }

        const availableLocations = Array.isArray(result.locations)
          ? result.locations
          : Array.isArray(result.data)
            ? result.data
            : [];

        setLocations(availableLocations);

        if (availableLocations.length > 0) {
          setLocationId(String(availableLocations[0].location_id));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load locations."
        );
      } finally {
        setLoadingLocations(false);
      }
    }

    loadLocations();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!locationId || !description.trim()) {
      setError("Please select a location and enter a description.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/emergencies", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emergency_type: emergencyType,
          location_id: Number(locationId),
          priority,
          description: description.trim(),
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit the emergency report."
        );
      }

      setSuccess(
        `Emergency report submitted successfully! Report ID: ${result.emergency_id}`
      );

      setDescription("");
      setPriority("MEDIUM");

      // Refresh the report list after successful submission.
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting the report."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 32px 18px;
          background: #f4f7fb;
          color: #172033;
          font-family: Arial, sans-serif;
        }

        .container {
          max-width: 760px;
          margin: 0 auto;
        }

        .brand {
          margin-bottom: 8px;
          color: #173b32;
          font-size: 30px;
          font-weight: 800;
        }

        .brand span {
          color: #18a875;
        }

        .subtitle {
          margin-bottom: 26px;
          color: #667085;
          line-height: 1.6;
        }

        .card {
          padding: 30px;
          background: white;
          border: 1px solid #e5eaf0;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(16, 24, 40, 0.05);
        }

        h1 {
          margin: 0 0 10px;
          font-size: 25px;
        }

        .intro {
          margin-bottom: 24px;
          color: #667085;
          line-height: 1.6;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        label {
          margin-top: 12px;
          font-size: 14px;
          font-weight: 700;
        }

        input,
        select,
        textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 13px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: white;
          color: #172033;
          font: inherit;
        }

        textarea {
          min-height: 130px;
          resize: vertical;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: 2px solid #b7ead6;
          border-color: #18a875;
        }

        .hint {
          color: #667085;
          font-size: 12px;
          line-height: 1.5;
        }

        .error,
        .success {
          margin: 16px 0;
          padding: 13px;
          border-radius: 8px;
          line-height: 1.5;
        }

        .error {
          background: #fff1f2;
          color: #be123c;
        }

        .success {
          background: #ecfdf3;
          color: #067647;
        }

        .submit {
          margin-top: 20px;
          padding: 14px;
          border: none;
          border-radius: 8px;
          background: #16845d;
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .submit:hover {
          background: #116b4b;
        }

        .submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }

        .navigation a {
          color: #176b50;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .card {
            padding: 21px;
          }
        }
      `}</style>

      <div className="container">
        <div className="brand">
          Campus<span>ResQ</span>
        </div>

        <p className="subtitle">
          Campus Emergency Response System
        </p>

        <section className="card">
          <h1>Report an Emergency</h1>

          <p className="intro">
            Provide accurate information so campus responders can identify
            the incident and reach the correct location.
          </p>

          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="success" role="status">
              {success}
              <p>
                Your report has been saved. You can view its status in
                Emergency Reports.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="emergencyType">Emergency type</label>

            <select
              id="emergencyType"
              value={emergencyType}
              onChange={(event) => setEmergencyType(event.target.value)}
              required
            >
              <option value="Medical">Medical Emergency</option>
              <option value="Fire">Fire</option>
              <option value="Security">Security Incident</option>
              <option value="Accident">Accident</option>
              <option value="Infrastructure">Infrastructure Problem</option>
              <option value="Other">Other</option>
            </select>

            <label htmlFor="location">Campus location</label>

            <select
              id="location"
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
              disabled={loadingLocations || locations.length === 0}
              required
            >
              <option value="">
                {loadingLocations
                  ? "Loading locations..."
                  : "Select a location"}
              </option>

              {locations.map((location) => (
                <option
                  key={location.location_id}
                  value={location.location_id}
                >
                  {[
                    location.building,
                    location.floor,
                    location.room,
                  ]
                    .filter(Boolean)
                    .join(" — ")}
                </option>
              ))}
            </select>

            <label htmlFor="priority">Priority</label>

            <select
              id="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <label htmlFor="description">Incident description</label>

            <textarea
              id="description"
              placeholder="Describe what happened and any important details."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={5000}
              required
            />

            <p className="hint">
              Provide clear details. Select Critical only for an incident
              requiring the highest level of immediate response.
            </p>

            <button
              className="submit"
              type="submit"
              disabled={
                submitting ||
                loadingLocations ||
                locations.length === 0
              }
            >
              {submitting ? "Submitting..." : "Submit Emergency Report"}
            </button>
          </form>
        </section>

        <nav className="navigation">
          <a href="/">Dashboard</a>
          <a href="/emergency-reports">Emergency Reports</a>
          <a href="/reports">Analytics</a>
        </nav>
      </div>
    </main>
  );
}