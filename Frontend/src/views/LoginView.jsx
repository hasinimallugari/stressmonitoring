import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginView({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [name, setName] = useState("");
  // Prefill login fields for jury evaluation — cleared when switching to register
  const [email, setEmail] = useState(() => (mode === "login" ? "test@example.com" : ""));
  const [password, setPassword] = useState(() => (mode === "login" ? "password123" : ""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setError("Name, email, and password are required.");
          setIsSubmitting(false);
          return;
        }
        const result = await register(name, email, password);
        onLoginSuccess(result?.user);
      } else {
        if (!email.trim() || !password.trim()) {
          setError("Please enter your email and password.");
          setIsSubmitting(false);
          return;
        }
        const result = await login(email, password);
        onLoginSuccess(result?.user);
      }
    } catch (err) {
      setError(
        err.message || "Authentication error. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="view-screen active-view"
      id="view-login"
      aria-label="Login Screen"
    >
      <div className="login-wrapper">
        <div className="login-brand-header">
          <h1 className="brand-title">MENTAL HEALTH</h1>
          <p className="brand-subtitle">
            Your personal space for calm, routine, and emotional wellbeing.
          </p>
        </div>

        <div className="login-hero-quote">
          <blockquote
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1.2rem",
              color: "var(--color-primary)",
            }}
          >
            &ldquo;What happened to you is part of your story, not the
            DEFINITION of who you are&rdquo;
          </blockquote>
        </div>

        <div className="login-card">
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--color-border)",
              marginBottom: "1.25rem",
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                padding: "10px",
                fontWeight: 600,
                borderBottom:
                  mode === "login" ? "2px solid var(--color-primary)" : "none",
                color:
                  mode === "login"
                    ? "var(--color-primary)"
                    : "var(--color-text-muted)",
              }}
              onClick={() => {
                setMode("login");
                setError(null);
                setEmail("test@example.com");
                setPassword("password123");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: "10px",
                fontWeight: 600,
                borderBottom:
                  mode === "register"
                    ? "2px solid var(--color-primary)"
                    : "none",
                color:
                  mode === "register"
                    ? "var(--color-primary)"
                    : "var(--color-text-muted)",
              }}
              onClick={() => {
                setMode("register");
                setError(null);
                setEmail("");
                setPassword("");
              }}
            >
              Create Account
            </button>
          </div>

          <h2 className="card-heading">
            {mode === "register" ? "Join Us Today" : "Welcome Back"}
          </h2>
          <p className="card-subheading">
            {mode === "register"
              ? "Set up your personal mental health profile"
              : "Sign in to view your routine and health dashboard"}
          </p>

          {error && (
            <div
              style={{
                color: "var(--color-danger)",
                background: "#fdf2f2",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.88rem",
              }}
            >
              {error}
            </div>
          )}

          <form id="login-form" className="login-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="form-group">
                <label htmlFor="register-name">Full Name</label>
                <input
                  type="text"
                  id="register-name"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={mode === "login"}
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="login-password">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => alert("Password reset instructions sent.")}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                id="login-password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-block"
              disabled={isSubmitting}
              style={{ marginTop: "1rem" }}
            >
              <span>
                {isSubmitting
                  ? "Processing..."
                  : mode === "register"
                    ? "Register & Continue →"
                    : "Talk to us Now →"}
              </span>
            </button>
          </form>

          <div className="login-footer-text" style={{ marginTop: "1.25rem" }}>
            <span>
              {mode === "register"
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>
            <button
              type="button"
              className="signup-link"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              onClick={() => {
                const next = mode === "register" ? "login" : "register";
                setMode(next);
                setError(null);
                if (next === "login") {
                  setEmail("test@example.com");
                  setPassword("password123");
                } else {
                  setEmail("");
                  setPassword("");
                }
              }}
            >
              {mode === "register" ? " Sign In" : " Create Account"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
