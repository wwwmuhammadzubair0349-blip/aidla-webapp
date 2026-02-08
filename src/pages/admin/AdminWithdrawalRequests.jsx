import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminWithdrawalRequests() {
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchEmail, setSearchEmail] = useState("");

  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [adminNote, setAdminNote] = useState({}); // tx -> note
  const [proofFile, setProofFile] = useState({}); // tx -> File

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
    },
    select: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      outline: "none",
      background: "#fff",
      fontWeight: 900,
    },
    btnGhost: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 900,
      cursor: "pointer",
    },

    list: { marginTop: 12, display: "grid", gap: 10 },
    item: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 14, background: "#fff" },
    top: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
    tx: { fontWeight: 900 },

    badge: (s) => ({
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: s === "approved" ? "#ecfeff" : s === "rejected" ? "#fef2f2" : "#fff7ed",
      fontWeight: 900,
      fontSize: 12,
    }),

    lockBadge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: 999,
      border: "1px solid #fecaca",
      background: "#fef2f2",
      fontWeight: 900,
      fontSize: 12,
      color: "#991b1b",
      marginLeft: 8,
    },

    small: { marginTop: 6, color: "#6b7280", fontSize: 13, lineHeight: 1.6 },
    actionBtn: {
      padding: "8px 10px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 900,
      cursor: "pointer",
    },

    msgOk: {
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 12,
      background: "#ecfeff",
      border: "1px solid #a5f3fc",
      color: "#155e75",
      fontWeight: 800,
    },
    msgErr: {
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 12,
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#991b1b",
      fontWeight: 800,
    },
  };

  const loadRequests = async () => {
    const { data, error } = await supabase.rpc("admin_list_withdraw_requests", {
      p_status: statusFilter || null,
      p_search_email: searchEmail || null,
      p_limit: 50,
      p_offset: 0,
    });
    if (error) throw error;
    setRows(Array.isArray(data) ? data : []);
  };

  const loadAll = async () => {
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      await loadRequests();
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRequests().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const uploadAdminProof = async (txNo, userId) => {
    const f = proofFile[txNo];
    if (!f) return null;

    const ext = (f.name.split(".").pop() || "png").toLowerCase();
    const safeExt = ["png", "jpg", "jpeg", "webp", "pdf"].includes(ext) ? ext : "png";
    const path = `withdrawals/${userId}/${txNo}-${Date.now()}.${safeExt}`;

    const { error } = await supabase.storage.from("payment_proofs").upload(path, f, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;

    return path;
  };

  const setStatus = async (r, newStatus) => {
    setErrorMsg("");
    setStatusMsg("");
    try {
      let proofPath = null;

      // optional proof upload on approval
      if (newStatus === "approved") {
        proofPath = await uploadAdminProof(r.tx_no, r.user_id);
      }

      const note = adminNote[r.tx_no] || null;

      const { error } = await supabase.rpc("admin_set_withdraw_status", {
        p_tx_no: r.tx_no,
        p_status: newStatus,
        p_admin_note: note,
        p_admin_proof_path: proofPath,
      });
      if (error) throw error;

      setStatusMsg(`Updated ${r.tx_no} → ${newStatus.toUpperCase()} ✅`);
      await loadRequests();
    } catch (e) {
      setErrorMsg(e?.message || "Failed to update status.");
    }
  };

  const lockRequest = async (txNo) => {
    setErrorMsg("");
    setStatusMsg("");
    try {
      const { error } = await supabase.rpc("admin_lock_withdraw_request", { p_tx_no: txNo });
      if (error) throw error;

      setStatusMsg(`Locked ${txNo} ✅`);
      await loadRequests();
    } catch (e) {
      setErrorMsg(e?.message || "Failed to lock.");
    }
  };

  const viewAdminProof = async (proofPath) => {
    try {
      const { data, error } = await supabase.storage.from("payment_proofs").createSignedUrl(proofPath, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch {
      alert("Could not open proof.");
    }
  };

  const toggleExpand = (txNo) => setExpanded((p) => ({ ...p, [txNo]: !p[txNo] }));

  const copyText = async (txt) => {
    try {
      await navigator.clipboard.writeText(String(txt || ""));
      setStatusMsg("Copied ✅");
      setTimeout(() => setStatusMsg(""), 800);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div>
        <h2 style={styles.title}>Withdrawal Management</h2>
        <p style={styles.sub}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={styles.title}>Withdrawal Management</h2>
      <p style={styles.sub}>Approve/reject requests only. Coins change is manual via Coins Management.</p>

      <div style={styles.card}>
        <div style={styles.row}>
          <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="">All</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            style={{ ...styles.input, flex: "1 1 320px" }}
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search by user email..."
          />

          <button style={styles.btnGhost} onClick={loadRequests} type="button">
            Search
          </button>

          <button style={styles.btnGhost} onClick={loadAll} type="button">
            Refresh
          </button>
        </div>

        {statusMsg ? <div style={styles.msgOk}>{statusMsg}</div> : null}
        {errorMsg ? <div style={styles.msgErr}>{errorMsg}</div> : null}

        <div style={styles.list}>
          {rows.length === 0 ? (
            <div style={styles.item}>
              <b>No requests found.</b>
            </div>
          ) : (
            rows.map((r) => {
              const open = !!expanded[r.tx_no];
              const locked = !!r.is_locked;

              return (
                <div key={r.tx_no} style={styles.item}>
                  <div style={styles.top}>
                    <div>
                      <div style={styles.tx}>
                        {r.tx_no}
                        {locked ? <span style={styles.lockBadge}>LOCKED</span> : null}
                      </div>

                      <div style={styles.small}>
                        <b>{r.user_email}</b> • {r.user_name || "-"} • Coins: <b>{r.coins}</b>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={styles.badge(r.status)}>{r.status.toUpperCase()}</div>
                      <button style={styles.actionBtn} onClick={() => copyText(r.user_email)} type="button">
                        Copy Email
                      </button>
                      <button style={styles.actionBtn} onClick={() => copyText(r.tx_no)} type="button">
                        Copy TX
                      </button>
                    </div>
                  </div>

                  <button style={styles.actionBtn} onClick={() => toggleExpand(r.tx_no)} type="button">
                    {open ? "Hide" : "Show More"}
                  </button>

                  {open ? (
                    <div style={styles.small}>
                      <div>
                        <b>Bank:</b> {r.payout_bank_name || "-"}
                      </div>
                      <div>
                        <b>Account Title:</b> {r.payout_account_title || "-"}
                      </div>
                      <div>
                        <b>Account No:</b> {r.payout_account_number || "-"}
                      </div>
                      <div>
                        <b>IBAN:</b> {r.payout_iban || "-"}
                      </div>
                      <div>
                        <b>Created:</b> {new Date(r.created_at).toLocaleString()}
                      </div>

                      {r.locked_at ? (
                        <div>
                          <b>Locked at:</b> {new Date(r.locked_at).toLocaleString()}
                        </div>
                      ) : null}

                      {r.admin_proof_path ? (
                        <button style={styles.actionBtn} onClick={() => viewAdminProof(r.admin_proof_path)} type="button">
                          View Admin Proof
                        </button>
                      ) : null}

                      <div style={{ marginTop: 10 }}>
                        <b>Admin Note (optional):</b>
                        <input
                          style={{ ...styles.input, width: "100%", marginTop: 8 }}
                          value={adminNote[r.tx_no] ?? r.admin_note ?? ""}
                          onChange={(e) => setAdminNote((p) => ({ ...p, [r.tx_no]: e.target.value }))}
                          placeholder="Write note..."
                          disabled={locked}
                        />
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <b>Optional proof upload (admin):</b>
                        <input
                          style={{ ...styles.input, width: "100%", marginTop: 8 }}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => setProofFile((p) => ({ ...p, [r.tx_no]: e.target.files?.[0] || null }))}
                          disabled={locked}
                        />
                      </div>

                      <div style={styles.row}>
                        {!locked ? (
                          <>
                            <button style={styles.btnGhost} onClick={() => setStatus(r, "approved")} type="button">
                              Approve
                            </button>
                            <button style={styles.btnGhost} onClick={() => setStatus(r, "rejected")} type="button">
                              Reject
                            </button>
                            <button style={styles.btnGhost} onClick={() => setStatus(r, "pending")} type="button">
                              Set Pending
                            </button>

                            <button
                              style={{ ...styles.btnGhost, borderColor: "#111827" }}
                              onClick={() => lockRequest(r.tx_no)}
                              type="button"
                            >
                              Lock / Finalize
                            </button>
                          </>
                        ) : (
                          <div style={{ fontWeight: 900, color: "#6b7280" }}>
                            Status controls disabled (locked)
                          </div>
                        )}
                      </div>

                      <div style={styles.small}>
                        After approving, admin will manually deduct coins using Coins Management page (use note: {r.tx_no}).
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
