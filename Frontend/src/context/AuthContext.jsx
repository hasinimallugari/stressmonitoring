import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const STORAGE_KEY = "mh_auth"; // localStorage key

const AuthContext = createContext();

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadStoredCredentials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email && parsed?.password) return parsed;
  } catch {
    // corrupted entry — ignore
  }
  return null;
}

function saveCredentials(email, password) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }));
  } catch {
    // storage unavailable (private browsing quota) — non-fatal
  }
}

function clearCredentials() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ email: "", password: "" });

  const [userProfile, setUserProfile] = useState({
    id: null,
    name: "",
    email: "",
    role: "Student / User",
    wellbeingScore: 0,
    wellbeingStatus: "—",
    doc: null,
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submittedForm, setSubmittedForm] = useState(false);
  // true while we're re-validating a stored session on first load
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const parseUserDoc = (docString) => {
    if (!docString) return null;
    try {
      return JSON.parse(docString);
    } catch (e) {
      console.warn("Failed to parse user_document JSON:", e);
      return null;
    }
  };

  const applyUserData = (data) => {
    const parsedDoc = parseUserDoc(data.user_document);
    setUserProfile({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role || "Student / User",
      wellbeingScore: data.wellbeing_score ?? 0,
      wellbeingStatus: data.wellbeing_status || "—",
      doc: parsedDoc,
    });
    setSubmittedForm(data.submitted_form ?? false);
    setIsAuthenticated(true);
  };

  // Called by AssessmentFormView after a successful submit-form response
  const markFormSubmitted = (data) => {
    applyUserData(data); // refreshes full profile including submitted_form: true
  };

  // ── Restore session on first mount ──────────────────────────────────────────
  useEffect(() => {
    const stored = loadStoredCredentials();

    if (!stored) {
      setIsRestoringSession(false);
      return;
    }

    // Re-validate stored credentials against the backend before trusting them
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            "X-User-Email": stored.email,
            "X-User-Password": stored.password,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAuth({ email: stored.email, password: stored.password });
          applyUserData(data);
        } else {
          // Credentials are stale / user deleted — clear them
          clearCredentials();
        }
      } catch {
        // Backend unreachable — don't clear credentials, just don't restore session
        // so the user can try logging in again manually
      } finally {
        setIsRestoringSession(false);
      }
    })();
  }, []); // runs once on mount

  // ── Auth actions ─────────────────────────────────────────────────────────────

  const register = async (name, email, password) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuth({ email: cleanEmail, password: cleanPassword });
      saveCredentials(cleanEmail, cleanPassword);
      applyUserData(data);
      return { success: true, user: data };
    } else {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Registration failed.");
    }
  };

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuth({ email: cleanEmail, password: cleanPassword });
      saveCredentials(cleanEmail, cleanPassword);
      applyUserData(data);
      return { success: true, user: data };
    } else {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Login failed.");
    }
  };

  const updateUserDoc = async (updatedDocObj, score = null, status = null) => {
    if (!auth.email || !auth.password) return;

    const docStr = JSON.stringify(updatedDocObj, null, 2);

    setUserProfile((prev) => ({
      ...prev,
      wellbeingScore: score !== null ? score : prev.wellbeingScore,
      wellbeingStatus: status !== null ? status : prev.wellbeingStatus,
      doc: updatedDocObj,
    }));

    try {
      await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": auth.email,
          "X-User-Password": auth.password,
        },
        body: JSON.stringify({
          user_document: docStr,
          wellbeing_score: score,
          wellbeing_status: status,
        }),
      });
    } catch (err) {
      console.warn("Failed to persist user doc update to backend DB:", err);
    }
  };

  const logout = () => {
    clearCredentials();
    setAuth({ email: "", password: "" });
    setUserProfile({
      id: null,
      name: "",
      email: "",
      role: "Student / User",
      wellbeingScore: 0,
      wellbeingStatus: "—",
      doc: null,
    });
    setSubmittedForm(false);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        userProfile,
        isAuthenticated,
        isRestoringSession,
        submittedForm,
        markFormSubmitted,
        login,
        register,
        updateUserDoc,
        logout,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
