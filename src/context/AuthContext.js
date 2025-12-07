// src/context/AuthContext
"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { httpFetch } from "@/lib/http/fetchClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⚡ ensures fetchLoginState does NOT run twice
  const hasLoadedOnce = useRef(false);

  const fetchLoginState = async () => {
    try {
      const data = await httpFetch("/auth/me", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      setLoggedIn(data.loggedIn ?? false);
      setUser(data.user || null);
    } catch {
      setLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Run only once (on first app load) instead of on every route change
  useEffect(() => {
    if (!hasLoadedOnce.current) {
      hasLoadedOnce.current = true;
      fetchLoginState();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        user,
        setUser,
        loading,
        fetchLoginState, // used after login/logout — keep as-is
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
