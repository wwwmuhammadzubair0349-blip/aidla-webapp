// src/pages/dashboard/wallet/RequestsHistory.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

// --- Icons ---
const Icons = {
  Refresh: ({ spinning }) => (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      style={{
        transition: "transform 0.5s ease",
        transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
      }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Deposit: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  Withdraw: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  File: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Clock: () => (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  X: () => (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Empty: () => (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

// --- Skeleton Loader ---
const CardSkeleton = () => (
  <div style={{ padding: "16px", background: "white", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "12px", animation: "pulse 1.5s infinite" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
      <div style={{ width: "100px", height: "14px", background: "#e2e8f0", borderRadius: "4px" }}></div>
      <div style={{ width: "60px", height: "20px", background: "#e2e8f0", borderRadius: "12px" }}></div>
    </div>
    <div style={{ width: "60%", height: "10px", background: "#e2e8f0", borderRadius: "4px", marginBottom: "6px" }}></div>
    <div style={{ width: "40%", height: "10px", background: "#e2e8f0", borderRadius: "4px" }}></div>
  </div>
);

export default function RequestsHistory() {
  const [tab, setTab] = useState("deposit"); // deposit | withdraw
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [depositRows, setDepositRows] = useState([]);
  const [withdrawRows, setWithdrawRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const styles = {
    container: {
      width: "100%",
      animation: "fadeIn 0.4s ease-out",
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      flexWrap: "wrap",
      gap: "10px",
    },
    title: { margin: 0, fontSize: "20px", fontWeight: 800, color: "#1e293b" },

    // Tabs
    tabContainer: {
      display: "inline-flex",
      background: "#f1f5f9",
      padding: "4px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
    },
    tabBtn: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      background: active ? "white" : "transparent",
      color: active ? "#0f172a" : "#64748b",
      fontWeight: 700,
      fontSize: "13px",
      cursor: "pointer",
      boxShadow: active ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
      transition: "all 0.2s ease",
    }),

    refreshBtn: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "8px 12px",
      cursor: "pointer",
      color: "#475569",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      fontWeight: 600,
      transition: "all 0.2s",
    },

    // Card List
    cardList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    card: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "16px",
      transition: "transform 0.1s, box-shadow 0.1s",
    },
    
    // Inside Card
    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "12px",
      gap: "10px",
    },
    txInfo: {
      display: "flex",
      flexDirection: "column",
    },
    txId: {
      fontSize: "12px",
      color: "#94a3b8",
      fontFamily: "monospace",
      marginBottom: "4px",
    },
    amount: {
      fontSize: "16px",
      fontWeight: 800,
      color: "#0f172a",
    },
    
    // Status Badge
    badge: (status) => {
      let bg = "#f1f5f9";
      let color = "#475569";
      if (status === "approved") { bg = "#ecfdf5"; color = "#059669"; }
      if (status === "rejected") { bg = "#fef2f2"; color = "#dc2626"; }
      if (status === "pending")  { bg = "#fff7ed"; color = "#ea580c"; }
      
      return {
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "20px",
        background: bg,
        color: color,
        fontWeight: 700,
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      };
    },

    // Details Section
    details: {
      fontSize: "13px",
      color: "#475569",
      lineHeight: 1.6,
      borderTop: "1px solid #f1f5f9",
      paddingTop: "12px",
      marginTop: "8px",
    },
    label: { fontWeight: 600, color: "#1e293b" },
    
    // Action Buttons (View Proof)
    proofBtn: {
      marginTop: "12px",
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
      color: "#334155",
      fontWeight: 600,
      fontSize: "12px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      transition: "background 0.2s",
    },
    
    adminNote: {
      marginTop: "10px",
      padding: "10px",
      background: "#fff1f2",
      border: "1px solid #fecaca",
      borderRadius: "8px",
      color: "#9f1239",
      fontSize: "12px",
      lineHeight: 1.4,
    },

    alert: {
      padding: "12px",
      borderRadius: "8px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#991b1b",
      fontSize: "13px",
      fontWeight: 600,
      marginBottom: "16px",
    },
    
    emptyState: {
      padding: "40px",
      textAlign: "center",
      color: "#64748b",
      background: "#f8fafc",
      borderRadius: "16px",
      border: "1px dashed #cbd5e1",
    },
  };

  useEffect(() => {
    // Animation styles
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const load = async () => {
    setLoading(true);
    setRefreshing(true);
    setErrorMsg("");
    try {
      const [dep, wdr] = await Promise.all([
        supabase.rpc("user_deposit_history", { p_limit: 50, p_offset: 0 }),
        supabase.rpc("user_withdraw_history", { p_limit: 50, p_offset: 0 }),
      ]);

      if (dep.error) throw dep.error;
      if (wdr.error) throw wdr.error;

      setDepositRows(Array.isArray(dep.data) ? dep.data : []);
      setWithdrawRows(Array.isArray(wdr.data) ? wdr.data : []);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load history.");
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openSigned = async (path) => {
    try {
      const { data, error } = await supabase.storage.from("payment_proofs").createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch {
      alert("Could not open proof.");
    }
  };

  const rows = tab === "deposit" ? depositRows : withdrawRows;

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    let icon = <Icons.Clock />;
    if (status === "approved") icon = <Icons.Check />;
    if (status === "rejected") icon = <Icons.X />;
    
    return (
      <span style={styles.badge(status)}>
        {icon} {status}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>History</h3>
        
        {/* Actions Row (Tabs + Refresh) */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={styles.tabContainer}>
            <button style={styles.tabBtn(tab === "deposit")} onClick={() => setTab("deposit")}>
              <Icons.Deposit /> Deposits
            </button>
            <button style={styles.tabBtn(tab === "withdraw")} onClick={() => setTab("withdraw")}>
              <Icons.Withdraw /> Withdraws
            </button>
          </div>
          
          <button 
            style={styles.refreshBtn} 
            onClick={load} 
            title="Refresh List"
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <Icons.Refresh spinning={refreshing} />
          </button>
        </div>
      </div>

      {errorMsg && <div style={styles.alert}>{errorMsg}</div>}

      <div style={styles.cardList}>
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : rows.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ marginBottom: 10 }}><Icons.Empty /></div>
            <div>No {tab} requests found.</div>
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.tx_no} style={styles.card}>
              
              {/* Card Top: ID + Amount + Status */}
              <div style={styles.cardTop}>
                <div style={styles.txInfo}>
                  <span style={styles.txId}>#{r.tx_no}</span>
                  <span style={styles.amount}>
                    {r.coins.toLocaleString()} Coins
                    {tab === "deposit" && (
                       <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                         {" "}({Number(r.money_amount).toFixed(2)} {r.currency})
                       </span>
                    )}
                  </span>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {/* Card Details */}
              <div style={styles.details}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#94a3b8" }}>Date:</span>
                  <span style={styles.label}>{new Date(r.created_at).toLocaleString()}</span>
                </div>

                {tab === "deposit" ? (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                     <span style={{ color: "#94a3b8" }}>Sender:</span>
                     <span style={styles.label}>{r.sender_name} <span style={{ fontWeight: 400, color: "#64748b" }}>({r.sender_bank_name})</span></span>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                     <span style={{ color: "#94a3b8" }}>To Bank:</span>
                     <span style={styles.label}>{r.payout_bank_name} <span style={{ fontWeight: 400, color: "#64748b" }}>• {r.payout_account_number}</span></span>
                  </div>
                )}

                {/* Admin Note */}
                {r.admin_note && (
                  <div style={styles.adminNote}>
                    <strong>Note from Admin:</strong> {r.admin_note}
                  </div>
                )}

                {/* Actions: Proofs */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {tab === "deposit" && r.proof_path && (
                    <button 
                      style={styles.proofBtn} 
                      onClick={() => openSigned(r.proof_path)}
                      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <Icons.File /> View My Proof
                    </button>
                  )}

                  {tab === "withdraw" && r.admin_proof_path && (
                    <button 
                      style={styles.proofBtn} 
                      onClick={() => openSigned(r.admin_proof_path)}
                      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <Icons.File /> View Admin Proof
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}