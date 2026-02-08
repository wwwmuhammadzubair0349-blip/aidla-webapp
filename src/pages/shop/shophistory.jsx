import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ShopHistory() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const styles = {
    title: { margin: 0, fontSize: 20, fontWeight: 900 },
    sub: { marginTop: 6, color: "#6b7280", fontWeight: 700, lineHeight: 1.6 },
    card: { marginTop: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 },
    item: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 14, background: "#fff", marginTop: 10 },
    top: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
    tx: { fontWeight: 900 },
    small: { marginTop: 6, color: "#6b7280", fontSize: 13, lineHeight: 1.6 },
    badge: (s) => ({
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: s === "approved" ? "#ecfeff" : s === "rejected" ? "#fef2f2" : "#fff7ed",
      fontWeight: 900,
      fontSize: 12,
    }),
    lockBadge: { marginLeft: 8, color: "#991b1b", fontWeight: 900 },
    msgErr: { marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 800 },
  };

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase.rpc("user_list_purchase_history", { p_limit: 50, p_offset: 0 });
      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 style={styles.title}>Shop Purchase History</h2>
      <div style={styles.sub}>Your shop requests (pending/approved/rejected).</div>

      {errorMsg ? <div style={styles.msgErr}>{errorMsg}</div> : null}

      <div style={styles.card}>
        {loading ? (
          <div style={{ fontWeight: 900 }}>Loading...</div>
        ) : rows.length === 0 ? (
          <div style={{ fontWeight: 900 }}>No purchases yet.</div>
        ) : (
          rows.map((r) => (
            <div key={r.tx_no} style={styles.item}>
              <div style={styles.top}>
                <div style={styles.tx}>
                  {r.tx_no} {r.is_locked ? <span style={styles.lockBadge}>🔒 Locked</span> : null}
                </div>
                <div style={styles.badge(r.status)}>{r.status.toUpperCase()}</div>
              </div>

              <div style={styles.small}>
                <b>{r.product_name}</b> • {String(r.product_type).toUpperCase()} • Qty: <b>{r.quantity}</b>
                <br />
                Total: <b>{Number(r.total_price_coins).toLocaleString()} coins</b>
                <br />
                Created: {new Date(r.created_at).toLocaleString()}
              </div>

              {r.admin_note ? (
                <div style={styles.small}>
                  <b>Admin note:</b> {r.admin_note}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
