// src/pages/dashboard/wallet/WalletOverview.jsx
import React, { useEffect, useState } from "react";

// --- Icons ---
const Icons = {
  Refresh: ({ spinning }) => (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      style={{
        transition: "transform 0.5s ease",
        transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
        flex: "0 0 auto",
      }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  TrendUp: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Activity: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export default function WalletOverview({ coins = 0, refreshWallet }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ make grid tighter on small screens (no overflow)
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 520px)");
    const onChange = () => setIsSmall(mq.matches);
    onChange();

    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.resolve(refreshWallet?.());
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const styles = {
    wrap: {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      overflowX: "hidden",
    },

    // ✅ KEY FIX: minmax(0,1fr) + smaller min width so it never spills right
    cardGrid: {
      width: "100%",
      minWidth: 0,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: isSmall ? 12 : 20,
      boxSizing: "border-box",
      alignItems: "stretch",
    },

    card: {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      position: "relative",
      background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      borderRadius: 16,
      border: "1px solid #e2e8f0",
      padding: isSmall ? 16 : 24,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      overflow: "hidden",
    },

    cardDecoration: {
      position: "absolute",
      top: -20,
      right: -20,
      width: 100,
      height: 100,
      background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
      borderRadius: "50%",
      zIndex: 0,
    },

    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
      position: "relative",
      zIndex: 1,
      gap: 10,
      minWidth: 0,
    },

    labelGroup: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },

    label: {
      fontSize: 12,
      fontWeight: 700,
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      margin: 0,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    sub: {
      fontSize: 11,
      color: "#94a3b8",
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    pill: (type) => ({
      flex: "0 0 auto",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 800,
      background: type === "success" ? "#ecfdf5" : "#eff6ff",
      color: type === "success" ? "#059669" : "#3b82f6",
      border: `1px solid ${type === "success" ? "#d1fae5" : "#dbeafe"}`,
      whiteSpace: "nowrap",
    }),

    valueBlock: { margin: "8px 0 20px", position: "relative", zIndex: 1, minWidth: 0 },

    // ✅ KEY FIX: wrap/ellipsis so long value never pushes right
    valueRow: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      flexWrap: "wrap",
      minWidth: 0,
    },

    value: {
      fontSize: "clamp(26px, 4vw, 36px)",
      fontWeight: 900,
      margin: 0,
      lineHeight: 1,
      background: "-webkit-linear-gradient(45deg, #0f172a 30%, #334155 90%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      minWidth: 0,
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    unit: {
      fontSize: 13,
      fontWeight: 700,
      color: "#64748b",
      whiteSpace: "nowrap",
      flex: "0 0 auto",
    },

    actionRow: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginTop: "auto",
      position: "relative",
      zIndex: 1,
      minWidth: 0,
      flexWrap: isSmall ? "wrap" : "nowrap",
    },

    // ✅ full width on small screens so it never squeezes/overflows
    btnPrimary: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "10px 14px",
      borderRadius: 10,
      border: "none",
      background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
      color: "white",
      fontWeight: 800,
      fontSize: 13,
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
      transition: "transform 0.12s ease",
      flexShrink: 0,
      width: isSmall ? "100%" : "auto",
    },

    infoText: {
      fontSize: 12,
      color: "#64748b",
      fontWeight: 600,
      lineHeight: 1.4,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    statusIndicator: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
      minWidth: 0,
    },
    pulseDot: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: "#10b981",
      boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)",
      animation: "pulse-green 2s infinite",
      flex: "0 0 auto",
    },
    statusTitle: {
      fontSize: 18,
      fontWeight: 900,
      color: "#1e293b",
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    syncBox: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
      background: "#f1f5f9",
      borderRadius: 10,
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      overflow: "hidden",
    },
    syncTextCol: { display: "flex", flexDirection: "column", minWidth: 0 },
    syncLabel: { fontSize: 11, fontWeight: 900, color: "#475569" },
    syncVal: { fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  };

  // Inject Pulse Animation
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulse-green {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={styles.wrap}>
      <div style={styles.cardGrid}>
        {/* --- Card 1: Balance --- */}
        <div style={styles.card}>
          <div style={styles.cardDecoration} />

          <div style={styles.headerRow}>
            <div style={styles.labelGroup}>
              <p style={styles.label}>Total Balance</p>
              <div style={styles.sub}>Available for withdrawal</div>
            </div>

            <div style={styles.pill("blue")}>
              <Icons.TrendUp /> Mining
            </div>
          </div>

          <div style={styles.valueBlock}>
            <div style={styles.valueRow}>
              <h3 style={styles.value}>{coins.toLocaleString()}</h3>
              <span style={styles.unit}>AIDLA</span>
            </div>
          </div>

          <div style={styles.actionRow}>
            <button
              style={styles.btnPrimary}
              onClick={handleRefresh}
              type="button"
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Icons.Refresh spinning={isRefreshing} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>

            <span style={styles.infoText}>Earn more via referrals & mining claims.</span>
          </div>
        </div>

        {/* --- Card 2: Status --- */}
        <div style={styles.card}>
          <div
            style={{
              ...styles.cardDecoration,
              background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
            }}
          />

          <div style={styles.headerRow}>
            <div style={styles.labelGroup}>
              <p style={styles.label}>Wallet Status</p>
              <div style={styles.sub}>Network Connectivity</div>
            </div>

            <div style={styles.pill("success")}>
              <Icons.ShieldCheck /> Secure
            </div>
          </div>

          <div style={styles.valueBlock}>
            <div style={styles.statusIndicator}>
              <div style={styles.pulseDot} />
              <span style={styles.statusTitle}>System Active</span>
            </div>

            <div style={{ ...styles.infoText, fontSize: 13, marginTop: 8 }}>
              All systems operational. Deposits and withdrawals are currently enabled.
            </div>
          </div>

          <div style={styles.actionRow}>
            <div style={styles.syncBox}>
              <div style={{ color: "#64748b", flex: "0 0 auto" }}>
                <Icons.Activity />
              </div>

              <div style={styles.syncTextCol}>
                <span style={styles.syncLabel}>LATEST SYNC</span>
                <span style={styles.syncVal}>Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
