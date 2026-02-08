// src/pages/dashboard/wallet/transactions.jsx
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
  ArrowUp: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  ),
  ArrowDown: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
    </svg>
  ),
  Filter: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  Empty: () => (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
};

// --- Skeleton Loader ---
const RowSkeleton = () => (
  <div style={{ 
    display: "flex", alignItems: "center", gap: "12px", padding: "16px", 
    borderBottom: "1px solid #f1f5f9", animation: "pulse 1.5s infinite" 
  }}>
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e2e8f0" }} />
    <div style={{ flex: 1 }}>
      <div style={{ width: "60%", height: 14, background: "#e2e8f0", marginBottom: 6, borderRadius: 4 }} />
      <div style={{ width: "40%", height: 10, background: "#e2e8f0", borderRadius: 4 }} />
    </div>
    <div style={{ width: 60, height: 14, background: "#e2e8f0", borderRadius: 4 }} />
  </div>
);

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const PAGE_SIZE = 25;

  const styles = {
    container: {
      width: "100%",
      animation: "fadeIn 0.4s ease-out",
    },
    headerRow: {
      marginBottom: "20px",
    },
    title: { margin: 0, fontSize: "20px", fontWeight: 800, color: "#1e293b" },
    sub: { margin: "4px 0 0", color: "#64748b", fontSize: "14px", fontWeight: 500 },

    // Controls Bar
    controlsCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
      marginBottom: "16px",
      boxShadow: "0 2px 4px -1px rgba(0,0,0,0.05)",
    },
    selectWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    select: {
      padding: "8px 12px 8px 36px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      background: "#f8fafc",
      fontWeight: 600,
      fontSize: "13px",
      color: "#334155",
      outline: "none",
      cursor: "pointer",
      appearance: "none", // hide default arrow
      minWidth: "120px",
    },
    selectIcon: {
      position: "absolute",
      left: "10px",
      color: "#64748b",
      pointerEvents: "none",
    },
    btnGhost: {
      padding: "8px 12px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#475569",
      fontWeight: 600,
      fontSize: "13px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.2s",
    },

    // List
    listCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      overflow: "hidden", // for corners
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    },
    rowItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      padding: "16px",
      borderBottom: "1px solid #f1f5f9",
      transition: "background 0.1s",
    },
    
    // Left side of row
    iconBox: (type) => ({
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: type === "credit" ? "#ecfdf5" : "#fef2f2",
      color: type === "credit" ? "#10b981" : "#ef4444",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }),
    metaCol: {
      flex: 1,
      minWidth: 0, // allow text ellipsis
    },
    reasonText: {
      fontSize: "14px",
      fontWeight: 700,
      color: "#0f172a",
      margin: "0 0 2px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    dateText: {
      fontSize: "12px",
      color: "#94a3b8",
      fontWeight: 500,
    },
    refBadge: {
      display: "inline-block",
      fontSize: "10px",
      padding: "2px 6px",
      borderRadius: "4px",
      background: "#f1f5f9",
      color: "#64748b",
      marginLeft: "6px",
      verticalAlign: "middle",
    },

    // Right side of row
    amountCol: {
      textAlign: "right",
      flexShrink: 0,
    },
    amountText: (type) => ({
      fontSize: "14px",
      fontWeight: 800,
      color: type === "credit" ? "#059669" : "#dc2626",
    }),
    balanceText: {
      fontSize: "11px",
      color: "#94a3b8",
      marginTop: "2px",
    },

    // Empty State
    emptyState: {
      padding: "40px 20px",
      textAlign: "center",
      color: "#64748b",
    },

    // Pagination
    pager: {
      padding: "12px 16px",
      background: "#f8fafc",
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    pageInfo: { fontSize: "13px", fontWeight: 600, color: "#64748b" },

    alert: (type) => ({
      marginBottom: "16px",
      padding: "12px",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: 600,
      background: type === "error" ? "#fef2f2" : "#ecfeff",
      color: type === "error" ? "#991b1b" : "#155e75",
      border: `1px solid ${type === "error" ? "#fecaca" : "#a5f3fc"}`,
    }),
  };

  useEffect(() => {
    // Animation styles
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      .row-hover:hover { background-color: #f8fafc; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const load = async (p = page) => {
    setLoading(true);
    setRefreshing(true);
    setErrorMsg("");
    setStatusMsg("");

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) throw new Error("Not logged in.");

      let q = supabase
        .from("user_transactions")
        .select("id, created_at, tx_type, transaction_amount, previous_balance, new_balance, reason, ref, note")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .range(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE - 1);

      if (typeFilter) q = q.eq("tx_type", typeFilter);

      const { data, error } = await q;
      if (error) throw error;

      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500); // Visual delay
    }
  };

  useEffect(() => {
    load(0);
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Transaction History</h3>
        <p style={styles.sub}>Track your coin movements</p>
      </div>

      <div style={styles.controlsCard}>
        <div style={styles.selectWrapper}>
          <div style={styles.selectIcon}><Icons.Filter /></div>
          <select 
            style={styles.select} 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="credit">Credits (In)</option>
            <option value="debit">Debits (Out)</option>
          </select>
        </div>

        <button 
          style={styles.btnGhost} 
          onClick={() => load(page)} 
          disabled={loading}
          title="Refresh List"
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <Icons.Refresh spinning={refreshing} />
          <span style={{ display: window.innerWidth < 400 ? "none" : "inline" }}>Refresh</span>
        </button>
      </div>

      {statusMsg && <div style={styles.alert("success")}>{statusMsg}</div>}
      {errorMsg && <div style={styles.alert("error")}>{errorMsg}</div>}

      <div style={styles.listCard}>
        {loading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : rows.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ marginBottom: 10 }}><Icons.Empty /></div>
            <div>No transactions found.</div>
          </div>
        ) : (
          <div>
            {rows.map((t) => (
              <div key={t.id} style={styles.rowItem} className="row-hover">
                
                {/* Icon */}
                <div style={styles.iconBox(t.tx_type)}>
                  {t.tx_type === "credit" ? <Icons.ArrowDown /> : <Icons.ArrowUp />}
                </div>

                {/* Details */}
                <div style={styles.metaCol}>
                  <div style={styles.reasonText}>
                    {t.reason || "Wallet Update"}
                    {t.ref && <span style={styles.refBadge}>Ref: {t.ref}</span>}
                  </div>
                  <div style={styles.dateText}>
                    {new Date(t.created_at).toLocaleDateString()} at {new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {t.note && <span> • {t.note}</span>}
                  </div>
                </div>

                {/* Amount */}
                <div style={styles.amountCol}>
                  <div style={styles.amountText(t.tx_type)}>
                    {t.tx_type === "credit" ? "+" : "-"}
                    {Number(t.transaction_amount || 0).toLocaleString()}
                  </div>
                  <div style={styles.balanceText}>
                    Bal: {Number(t.new_balance || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        <div style={styles.pager}>
          <button
            style={{...styles.btnGhost, opacity: page === 0 ? 0.5 : 1}}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            <Icons.ChevronLeft /> Prev
          </button>

          <span style={styles.pageInfo}>Page {page + 1}</span>

          <button
            style={{...styles.btnGhost, opacity: (loading || rows.length < PAGE_SIZE) ? 0.5 : 1}}
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || rows.length < PAGE_SIZE}
          >
            Next <Icons.ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}