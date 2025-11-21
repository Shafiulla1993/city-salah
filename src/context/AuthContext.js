// src/context/AuthContext
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { httpFetch } from "@/lib/http/fetchClient";
import { usePathname } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  const fetchLoginState = async () => {
    try {
      const data = await httpFetch("/auth/me", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      setLoggedIn(data.loggedIn ?? false);
      setUser(data.user || null);
    } catch (err) {
      setLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 RUN ON EVERY ROUTE CHANGE
  useEffect(() => {
    fetchLoginState();
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        user,
        setUser,
        loading,
        fetchLoginState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
