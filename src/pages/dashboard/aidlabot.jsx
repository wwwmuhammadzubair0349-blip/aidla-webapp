import React from "react";

export default function AidlaBot() {
  const styles = {
    title: { margin: 0, fontSize: 22, fontWeight: 900 },
    badge: {
      display: "inline-block",
      marginTop: 10,
      padding: "6px 10px",
      borderRadius: 999,
      background: "#ecfccb",
      border: "1px solid #d9f99d",
      color: "#365314",
      fontWeight: 900,
    },
    text: { marginTop: 10, color: "#4b5563", lineHeight: 1.7 },
  };

  return (
    <div>
      <h2 style={styles.title}>AIDLA Bot</h2>
      <div style={styles.badge}>Coming Soon</div>
      <p style={styles.text}>
        Chat UI for AIDLA bot: questions, answers, learning assistant, and support.
      </p>
    </div>
  );
}
