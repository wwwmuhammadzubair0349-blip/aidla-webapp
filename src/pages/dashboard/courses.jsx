import React from "react";

export default function Courses() {
  const styles = {
    title: { margin: 0, fontSize: 22, fontWeight: 900 },
    badge: {
      display: "inline-block",
      marginTop: 10,
      padding: "6px 10px",
      borderRadius: 999,
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      color: "#0f172a",
      fontWeight: 900,
    },
    text: { marginTop: 10, color: "#4b5563", lineHeight: 1.7 },
  };

  return (
    <div>
      <h2 style={styles.title}>Courses</h2>
      <div style={styles.badge}>Coming Soon</div>
      <p style={styles.text}>
        Courses list, categories, enroll button, and course player page later.
      </p>
    </div>
  );
}
