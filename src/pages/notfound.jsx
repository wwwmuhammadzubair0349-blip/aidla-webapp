import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  const styles = {
    box: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 22,
      textAlign: "center",
    },
    title: { margin: 0, fontSize: 26, marginBottom: 10 },
    link: {
      display: "inline-block",
      marginTop: 10,
      padding: "10px 12px",
      borderRadius: 12,
      background: "#0d6efd",
      color: "#fff",
      textDecoration: "none",
      fontWeight: 800,
    },
  };

  return (
    <div style={styles.box}>
      <h1 style={styles.title}>404 - Page Not Found</h1>
      <p style={{ margin: 0, color: "#4b5563" }}>
        This route doesn’t exist.
      </p>
      <Link to="/" style={styles.link}>Go Home</Link>
    </div>
  );
}
