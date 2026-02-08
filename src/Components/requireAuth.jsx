import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function withTimeout(promise, ms = 4000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Auth check timeout")), ms)),
  ]);
}

export default function RequireAuth({ children }) {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);
  const [debugErr, setDebugErr] = useState("");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setChecking(true);
      setDebugErr("");

      try {
        // FAST local session check + timeout
        const { data } = await withTimeout(supabase.auth.getSession(), 4000);

        if (!mounted) return;
        const session = data?.session;

        setOk(!!session);
        setChecking(false);
      } catch (e) {
        if (!mounted) return;
        setOk(false);
        setChecking(false);
        setDebugErr(e?.message || "Auth check failed");
        console.error("RequireAuth error:", e);
      }
    };

    run();

    // Listen for session changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setOk(!!session);
      setChecking(false);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (checking) {
    return (
      <div style={{ fontWeight: 900 }}>
        Checking session...
      </div>
    );
  }

  // If failed, show debug message (so you can see why)
  if (!ok) {
    return (
      <div>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>
          Not logged in (or auth check failed)
        </div>
        {debugErr ? (
          <div style={{ color: "#991b1b", fontWeight: 800 }}>
            Debug: {debugErr}
          </div>
        ) : null}
        <div style={{ marginTop: 10 }}>
          <Navigate to="/login" replace state={{ from: location.pathname }} />
        </div>
      </div>
    );
  }

  return children;
}
