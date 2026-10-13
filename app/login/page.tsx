"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      // The server sets the HttpOnly authentication cookie.
      // The browser stores it automatically.
      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to CampusResQ. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand">
          Campus<span>ResQ</span>
        </div>

        <p className="tagline">
          Campus Emergency Response System
        </p>

        <div className="heading">
          <h1>Welcome back</h1>
          <p>Sign in to access your CampusResQ account.</p>
        </div>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="security-note">
          <span>🔒</span>
          Your session is protected by secure authentication.
        </div>

        <div className="help">
          For account assistance, contact your campus administrator.
        </div>
      </section>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #f1f5f9;
          color: #0f172a;
          font-family: Arial, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
        }

        .brand {
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .brand span {
          color: #00a873;
        }

        .tagline {
          margin-top: 8px;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }

        .heading {
          margin: 35px 0 25px;
        }

        .heading h1 {
          margin: 0 0 8px;
          font-size: 26px;
        }

        .heading p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
        }

        form {
          display: flex;
          flex-direction: column;
        }

        label {
          margin: 16px 0 8px;
          font-size: 14px;
          font-weight: 600;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          font-size: 15px;
        }

        input:focus {
          border-color: #00a873;
          box-shadow: 0 0 0 3px rgba(0, 168, 115, 0.12);
        }

        button {
          margin-top: 25px;
          padding: 14px;
          border: none;
          border-radius: 8px;
          background: #00a873;
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        button:hover {
          background: #008f61;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 16px;
          padding: 12px;
          border-radius: 8px;
          background: #fff1f2;
          color: #be123c;
          font-size: 14px;
          line-height: 1.5;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 25px;
          color: #64748b;
          font-size: 12px;
        }

        .help {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 28px 22px;
          }
        }
      `}</style>
    </main>
  );
}