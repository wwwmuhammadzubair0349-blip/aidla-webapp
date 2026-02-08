import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const ADMIN_EMAIL = "zkafridi317@gmail.com";

function withTimeout(promise, ms = 4000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Admin auth check timeout")), ms)),
  ]);
}

export default function RequireAdmin({ children }) {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [debugErr, setDebugErr] = useState("");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setChecking(true);
      setDebugErr("");

      try {
        const { data } = await withTimeout(supabase.auth.getSession(), 4000);
        if (!mounted) return;

        const session = data?.session;
        if (!session) {
          setLoggedIn(false);
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        setLoggedIn(true);
        const email = (session.user?.email || "").toLowerCase();
        setIsAdmin(email === ADMIN_EMAIL);
        setChecking(false);
      } catch (e) {
        if (!mounted) return;
        setLoggedIn(false);
        setIsAdmin(false);
        setChecking(false);
        setDebugErr(e?.message || "Admin auth check failed");
        console.error("RequireAdmin error:", e);
      }
    };

    run();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setLoggedIn(false);
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      setLoggedIn(true);
      const email = (session.user?.email || "").toLowerCase();
      setIsAdmin(email === ADMIN_EMAIL);
      setChecking(false);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (checking) {
    return <div style={{ fontWeight: 900 }}>Checking admin access...</div>;
  }

  if (!loggedIn) {
    return (
      <div>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Not logged in</div>
        {debugErr ? <div style={{ color: "#991b1b", fontWeight: 800 }}>Debug: {debugErr}</div> : null}
        <Navigate to="/login" replace state={{ from: location.pathname }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Not an admin</div>
        <Navigate to="/choose-side" replace state={{ from: location.pathname }} />
      </div>
    );
  }

  return children;
}
