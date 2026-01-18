// src/app/auth/logout/page.js

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LogoutPage() {
  const router = useRouter();
  const { setLoggedIn, setUser } = useAuth();

  useEffect(() => {
    async function doLogout() {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setLoggedIn(false);
      setUser(null);
      router.replace("/");
    }

    doLogout();
  }, [router, setLoggedIn, setUser]);

  return <p className="text-center mt-10">Logging out...</p>;
}
