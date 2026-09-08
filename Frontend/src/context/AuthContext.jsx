import React, { createContext, useContext, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    email: "",
    password: "",
  });

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

  const parseUserDoc = (docString) => {
    if (!docString) return null;
    try {
      return JSON.parse(docString);
    } catch (e) {
      console.warn("Failed to parse user_document JSON:", e);
      return null;
    }
  };

  const register = async (name, email, password) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setAuth({ email: cleanEmail, password: cleanPassword });

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
      setIsAuthenticated(true);
      return { success: true, user: data };
    } else {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Registration failed.");
    }
  };

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setAuth({ email: cleanEmail, password: cleanPassword });

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    });

    if (response.ok) {
      const data = await response.json();
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
      setIsAuthenticated(true);
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
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        userProfile,
        isAuthenticated,
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
