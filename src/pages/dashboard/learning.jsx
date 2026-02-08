import React from "react";

export default function Learning() {
  const styles = {
    title: { margin: 0, fontSize: 22, fontWeight: 900 },
    badge: {
      display: "inline-block",
      marginTop: 10,
      padding: "6px 10px",
      borderRadius: 999,
      background: "#fdf2f8",
      border: "1px solid #fbcfe8",
      color: "#9d174d",
      fontWeight: 900,
    },
    text: { marginTop: 10, color: "#4b5563", lineHeight: 1.7 },
  };

  return (
    <div>
      <h2 style={styles.title}>Learning</h2>
      <div style={styles.badge}>Coming Soon</div>
      <p style={styles.text}>
        Learning dashboard: progress, quizzes, certificates, and recommendations.
      </p>
    </div>
  );
}
