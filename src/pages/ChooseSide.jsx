import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ChooseSide() {
  const navigate = useNavigate();
  const ADMIN_EMAIL = "zkafridi317@gmail.com";

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  const styles = {
    wrap: {
      maxWidth: 720,
      margin: "0 auto",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 22,
      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    },
    title: { margin: 0, fontSize: 26, fontWeight: 900 },
    subtitle: { marginTop: 8, color: "#4b5563", fontWeight: 700, lineHeight: 1.6 },
    row: { marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" },
    btnPrimary: {
      flex: "1 1 240px",
      padding: "12px 14px",
      borderRadius: 14,
      border: 0,
      background: "#0d6efd",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
    },
    btnDark: {
      flex: "1 1 240px",
      padding: "12px 14px",
      borderRadius: 14,
      border: 0,
      background: "#111827",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
    },
    pill: {
      marginTop: 12,
      display: "inline-block",
      padding: "8px 10px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 800,
      color: "#374151",
    },
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const userEmail = (user.email || "").toLowerCase();
      setEmail(userEmail);

      // ✅ If not admin, block this page
      if (userEmail !== ADMIN_EMAIL) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setLoading(false);
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div style={styles.wrap}>
        <h1 style={styles.title}>Loading...</h1>
        <p style={styles.subtitle}>Checking admin access</p>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>Welcome Admin</h1>
      <p style={styles.subtitle}>
        Choose where you want to go. You can access both User side and Admin side.
      </p>

      <div style={styles.pill}>Logged in as: {email}</div>

      <div style={styles.row}>
        <button style={styles.btnPrimary} onClick={() => navigate("/dashboard")} type="button">
          User Side
        </button>

        <button style={styles.btnDark} onClick={() => navigate("/admin")} type="button">
          Admin Side
        </button>
      </div>
    </div>
  );
}
