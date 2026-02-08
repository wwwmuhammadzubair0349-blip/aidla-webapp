import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPurchaseRequests() {
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState(""); // ""=All, "pending", "approved", "rejected"
  const [searchEmail, setSearchEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");

  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState({}); // tx_no -> bool
  const [adminNote, setAdminNote] = useState({}); // tx_no -> note

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const inFlight = useRef(false);
  const lastReqKey = useRef("");

  const styles = {
    title: { margin: 0, fontSize: 20, fontWeight: 900 },
    sub: { marginTop: 6, color: "#6b7280", fontWeight: 700, lineHeight: 1.6 },
    card: { marginTop: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 },

    row: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    input: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      outline: "none",
      background: "#fff",
      fontWeight: 800,
      width: "100%",
    },
    select: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      outline: "none",
      background: "#fff",
      fontWeight: 900,
    },
    btn: {
      padding: "10px 12px",
      borderRadius: 12,
      border: 0,
      background: "#111827",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
    },
    btnGhost: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 900,
      cursor: "pointer",
    },
    actionBtn: {
      padding: "8px 10px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 900,
      cursor: "pointer",
    },

    list: { marginTop: 12, display: "grid", gap: 10 },
    item: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 14, background: "#fff" },

    top: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
    left: { minWidth: 260 },
    tx: { fontWeight: 900, fontSize: 14 },
    meta: { marginTop: 6, color: "#374151", fontSize: 13, lineHeight: 1.6 },
    small: { marginTop: 6, color: "#6b7280", fontSize: 12.5, lineHeight: 1.6 },

    badge: (s) => ({
      display: "inline-block",
      padding: "5px 10px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: s === "approved" ? "#ecfeff" : s === "rejected" ? "#fef2f2" : s === "pending" ? "#fff7ed" : "#f3f4f6",
      color: s === "approved" ? "#155e75" : s === "rejected" ? "#991b1b" : "#7c2d12",
      fontWeight: 900,
      fontSize: 12,
      whiteSpace: "nowrap",
    }),

    lock: {
      display: "inline-block",
      marginLeft: 8,
      padding: "4px 8px",
      borderRadius: 999,
      background: "#fee2e2",
      border: "1px solid #fecaca",
      color: "#991b1b",
      fontWeight: 900,
      fontSize: 12,
    },

    detailsBox: {
      marginTop: 10,
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 12,
    },
    pre: {
      margin: 0,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 12.5,
      color: "#111827",
      lineHeight: 1.55,
    },

    msgOk: { marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "#ecfeff", border: "1px solid #a5f3fc", color: "#155e75", fontWeight: 800 },
    msgErr: { marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 800 },

    kpiRow: { marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 },
    kpi: { border: "1px solid #e5e7eb", background: "#fff", borderRadius: 16, padding: 12 },
    kpiLabel: { color: "#6b7280", fontWeight: 800, fontSize: 12.5 },
    kpiValue: { marginTop: 6, fontWeight: 900, fontSize: 18 },
  };

  // Debounce search (reduces RPC calls a lot)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(searchEmail.trim()), 450);
    return () => clearTimeout(t);
  }, [searchEmail]);

  const computeKpis = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.status === "pending").length;
    const approved = rows.filter((r) => r.status === "approved").length;
    const rejected = rows.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [rows]);

  const load = useCallback(async (opts = { showSpinner: true }) => {
    if (inFlight.current) return;

    const reqKey = `${statusFilter || ""}__${debouncedEmail || ""}`;
    // avoid duplicate same request back-to-back
    if (lastReqKey.current === reqKey && !opts.force) return;

    inFlight.current = true;
    lastReqKey.current = reqKey;

    if (opts.showSpinner) setLoading(true);
    setErrorMsg("");
    setStatusMsg("");

    try {
      const { data, error } = await supabase.rpc("admin_list_purchase_requests", {
        p_status: statusFilter || null,
        p_search_email: debouncedEmail || null,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load purchase requests.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [statusFilter, debouncedEmail]);

  useEffect(() => {
    load({ showSpinner: true, force: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload when filters change (fast / no heavy spinner)
  useEffect(() => {
    load({ showSpinner: false });
  }, [load]);

  const toggleExpand = (txNo) => setExpanded((p) => ({ ...p, [txNo]: !p[txNo] }));

  // Optimistic status change
  const setStatus = async (txNo, newStatus) => {
    setErrorMsg("");
    setStatusMsg("");

    // optimistic update
    setRows((prev) => prev.map((r) => (r.tx_no === txNo ? { ...r, status: newStatus } : r)));

    try {
      const note = adminNote[txNo] ?? null;
      const { error } = await supabase.rpc("admin_set_purchase_status", {
        p_tx_no: txNo,
        p_status: newStatus,
        p_admin_note: note,
      });
      if (error) throw error;

      setStatusMsg(`Updated ${txNo} → ${newStatus.toUpperCase()} ✅`);
      // refresh silently to sync (fast)
      load({ showSpinner: false, force: true });
    } catch (e) {
      setErrorMsg(e?.message || "Failed to update status.");
      // rollback by reloading
      load({ showSpinner: false, force: true });
    }
  };

  // Optimistic lock
  const lockRequest = async (txNo) => {
    setErrorMsg("");
    setStatusMsg("");

    setRows((prev) => prev.map((r) => (r.tx_no === txNo ? { ...r, is_locked: true } : r)));

    try {
      const { error } = await supabase.rpc("admin_lock_purchase_request", { p_tx_no: txNo });
      if (error) throw error;

      setStatusMsg(`Locked ${txNo} ✅`);
      load({ showSpinner: false, force: true });
    } catch (e) {
      setErrorMsg(e?.message || "Failed to lock request.");
      load({ showSpinner: false, force: true });
    }
  };

  return (
    <div>
      <h2 style={styles.title}>Purchase Requests</h2>
      <p style={styles.sub}>
        Review orders. When approved: coins deducted + stock reduced + revenue recorded. If reverted: refund + stock restored. Lock disables further changes.
      </p>

      {/* KPIs */}
      <div style={styles.kpiRow}>
        <div style={styles.kpi}><div style={styles.kpiLabel}>Total Shown</div><div style={styles.kpiValue}>{computeKpis.total}</div></div>
        <div style={styles.kpi}><div style={styles.kpiLabel}>Pending</div><div style={styles.kpiValue}>{computeKpis.pending}</div></div>
        <div style={styles.kpi}><div style={styles.kpiLabel}>Approved</div><div style={styles.kpiValue}>{computeKpis.approved}</div></div>
        <div style={styles.kpi}><div style={styles.kpiLabel}>Rejected</div><div style={styles.kpiValue}>{computeKpis.rejected}</div></div>
      </div>

      <div style={styles.card}>
        {/* Filters */}
        <div style={styles.row}>
          <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <div style={{ flex: "1 1 340px" }}>
            <input
              style={styles.input}
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Search by user email..."
            />
            <div style={styles.small}>Search is debounced (faster). It runs after you stop typing.</div>
          </div>

          <button style={styles.btnGhost} onClick={() => load({ showSpinner: false, force: true })} type="button">
            Refresh
          </button>
        </div>

        {statusMsg ? <div style={styles.msgOk}>{statusMsg}</div> : null}
        {errorMsg ? <div style={styles.msgErr}>{errorMsg}</div> : null}

        {/* List */}
        {loading ? (
          <div style={{ marginTop: 12, fontWeight: 900 }}>Loading...</div>
        ) : (
          <div style={styles.list}>
            {rows.length === 0 ? (
              <div style={styles.item}><b>No requests found.</b></div>
            ) : (
              rows.map((r) => {
                const open = !!expanded[r.tx_no];
                const locked = !!r.is_locked;

                return (
                  <div key={r.tx_no} style={styles.item}>
                    <div style={styles.top}>
                      <div style={styles.left}>
                        <div style={styles.tx}>
                          {r.tx_no}
                          {locked ? <span style={styles.lock}>LOCKED</span> : null}
                        </div>

                        <div style={styles.meta}>
                          <b>{r.user_email}</b> • {r.user_name || "-"}
                          <br />
                          Product: <b>{r.product_name}</b> • <b>{String(r.product_type || "").toUpperCase()}</b>
                          <br />
                          Qty: <b>{r.quantity}</b> • Total: <b>{Number(r.total_price_coins || 0).toLocaleString()} coins</b>
                        </div>

                        <div style={styles.small}>
                          Created: {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                          {r.locked_at ? ` • Locked: ${new Date(r.locked_at).toLocaleString()}` : ""}
                        </div>
                      </div>

                      <div style={styles.badge(r.status || "pending")}>{String(r.status || "pending").toUpperCase()}</div>
                    </div>

                    <div style={styles.row}>
                      <button style={styles.actionBtn} onClick={() => toggleExpand(r.tx_no)} type="button">
                        {open ? "Hide Details" : "Show Details"}
                      </button>

                      {!locked ? (
                        <>
                          <button style={styles.btnGhost} onClick={() => setStatus(r.tx_no, "approved")} type="button">
                            Approve
                          </button>
                          <button style={styles.btnGhost} onClick={() => setStatus(r.tx_no, "rejected")} type="button">
                            Reject
                          </button>
                          <button style={styles.btnGhost} onClick={() => setStatus(r.tx_no, "pending")} type="button">
                            Pending
                          </button>
                          <button style={{ ...styles.btn, background: "#0f172a" }} onClick={() => lockRequest(r.tx_no)} type="button">
                            Lock
                          </button>
                        </>
                      ) : (
                        <div style={{ fontWeight: 900, color: "#6b7280" }}>Status controls disabled (locked)</div>
                      )}
                    </div>

                    {open ? (
                      <div style={styles.detailsBox}>
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>User Details</div>
                        <pre style={styles.pre}>{JSON.stringify(r.order_details || {}, null, 2)}</pre>

                        <div style={{ marginTop: 10, fontWeight: 900 }}>Admin Note (optional)</div>
                        <input
                          style={{ ...styles.input, marginTop: 8 }}
                          value={adminNote[r.tx_no] ?? r.admin_note ?? ""}
                          onChange={(e) => setAdminNote((p) => ({ ...p, [r.tx_no]: e.target.value }))}
                          placeholder="Write note..."
                          disabled={locked}
                        />
                        <div style={styles.small}>
                          Tip: write transaction reference in note (e.g. “coins sent in coins management: {r.tx_no}”).
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
