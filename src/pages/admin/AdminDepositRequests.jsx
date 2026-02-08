import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminDepositRequests() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [settings, setSettings] = useState(null);

  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchEmail, setSearchEmail] = useState("");
  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState({});

  const [adminNote, setAdminNote] = useState({}); // tx_no -> note

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Settings compact/expand
  const [settingsEditOpen, setSettingsEditOpen] = useState(false);

  const styles = {
    title: { margin: 0, fontSize: 20, fontWeight: 900 },
    sub: { marginTop: 6, color: "#6b7280", fontWeight: 700, lineHeight: 1.6 },
    card: { marginTop: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 },

    grid: { marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },
    field: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 16, padding: 12 },

    label: { display: "block", fontWeight: 900, marginBottom: 8 },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      outline: "none",
      background: "#fff",
      fontWeight: 800,
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      outline: "none",
      background: "#fff",
      fontWeight: 900,
    },
    row: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },

    btn: {
      padding: "10px 12px",
      borderRadius: 12,
      border: 0,
      background: "#0d6efd",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
      opacity: savingSettings ? 0.7 : 1,
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
    },

    small: { marginTop: 6, color: "#6b7280", fontSize: 13, lineHeight: 1.6 },

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

    actionBtn: {
      padding: "8px 10px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 900,
      cursor: "pointer",
    },

    // ✅ compact settings header row
    settingsBar: {
      marginTop: 10,
      padding: 12,
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      display: "flex",
      gap: 10,
      justifyContent: "space-between",
      flexWrap: "wrap",
      alignItems: "center",
    },
    settingsMeta: { color: "#111827", fontWeight: 900, lineHeight: 1.6 },
    settingsMetaSmall: { color: "#6b7280", fontWeight: 800, fontSize: 13, marginTop: 2 },
  };

  const loadSettings = async () => {
    const { data, error } = await supabase.rpc("get_payment_settings");
    if (error) throw error;
    setSettings(data);
  };

  const loadRequests = async () => {
    const { data, error } = await supabase.rpc("admin_list_deposit_requests", {
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
      await loadSettings();
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

  const saveSettings = async () => {
    setSavingSettings(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      const { error } = await supabase.rpc("admin_update_payment_settings", {
        p_coin_price: Number(settings.coin_price),
        p_currency: settings.currency,
        p_bank_name: settings.bank_name,
        p_account_title: settings.account_title,
        p_account_number: settings.account_number,
        p_iban: settings.iban,
        p_swift_code: settings.swift_code,
        p_instructions: settings.instructions,
      });
      if (error) throw error;

      setStatusMsg("Settings saved ✅");
      setSettingsEditOpen(false);
      await loadSettings();
    } catch (e) {
      setErrorMsg(e?.message || "Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const setStatus = async (txNo, newStatus) => {
    setErrorMsg("");
    setStatusMsg("");
    try {
      const note = adminNote[txNo] || null;
      const { error } = await supabase.rpc("admin_set_deposit_status", {
        p_tx_no: txNo,
        p_status: newStatus,
        p_admin_note: note,
      });
      if (error) throw error;

      setStatusMsg(`Updated ${txNo} → ${newStatus.toUpperCase()} ✅`);
      await loadRequests();
    } catch (e) {
      setErrorMsg(e?.message || "Failed to update status.");
    }
  };

  const lockRequest = async (txNo) => {
    setErrorMsg("");
    setStatusMsg("");
    try {
      const { error } = await supabase.rpc("admin_lock_deposit_request", { p_tx_no: txNo });
      if (error) throw error;

      setStatusMsg(`Locked ${txNo} ✅`);
      await loadRequests();
    } catch (e) {
      setErrorMsg(e?.message || "Failed to lock.");
    }
  };

  const viewProof = async (proofPath) => {
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
        <h2 style={styles.title}>Deposit Management</h2>
        <p style={styles.sub}>Loading...</p>
      </div>
    );
  }

  const currency = settings?.currency || "AED";

  return (
    <div>
      <h2 style={styles.title}>Deposit Management</h2>
      <p style={styles.sub}>
        Admin sets price/bank + reviews deposit requests. Approval does NOT auto-send coins (manual via Coins Management).
      </p>

      {/* ✅ SETTINGS (single row summary, expand on edit) */}
      <div style={styles.card}>
        <div style={{ fontWeight: 900 }}>Deposit Settings</div>

        <div style={styles.settingsBar}>
          <div>
            <div style={styles.settingsMeta}>
              1 Coin = {Number(settings?.coin_price || 0).toFixed(2)} {currency}
            </div>
            <div style={styles.settingsMetaSmall}>
              Bank: {settings?.bank_name || "-"} • A/C: {settings?.account_number || "-"} • IBAN: {settings?.iban || "-"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={styles.btnGhost} onClick={() => setSettingsEditOpen((p) => !p)} type="button">
              {settingsEditOpen ? "Close" : "Edit"}
            </button>
            <button style={styles.btnGhost} onClick={loadAll} type="button">
              Refresh
            </button>
          </div>
        </div>

        {settingsEditOpen ? (
          <>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Coin Price</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  value={settings?.coin_price ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, coin_price: e.target.value }))}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Currency</label>
                <input
                  style={styles.input}
                  value={settings?.currency ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Bank Name</label>
                <input
                  style={styles.input}
                  value={settings?.bank_name ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, bank_name: e.target.value }))}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Account Title</label>
                <input
                  style={styles.input}
                  value={settings?.account_title ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, account_title: e.target.value }))}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Account Number</label>
                <input
                  style={styles.input}
                  value={settings?.account_number ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, account_number: e.target.value }))}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>IBAN</label>
                <input
                  style={styles.input}
                  value={settings?.iban ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, iban: e.target.value }))}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>SWIFT</label>
                <input
                  style={styles.input}
                  value={settings?.swift_code ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, swift_code: e.target.value }))}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Instructions</label>
                <input
                  style={styles.input}
                  value={settings?.instructions ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, instructions: e.target.value }))}
                />
              </div>
            </div>

            <div style={styles.row}>
              <button style={styles.btn} onClick={saveSettings} disabled={savingSettings} type="button">
                {savingSettings ? "Saving..." : "Save Settings"}
              </button>
              <button style={styles.btnGhost} onClick={() => setSettingsEditOpen(false)} disabled={savingSettings} type="button">
                Cancel
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* REQUESTS */}
      <div style={styles.card}>
        <div style={{ fontWeight: 900 }}>Deposit Requests</div>

        <div style={styles.row}>
          <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="">All</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            style={{ ...styles.input, maxWidth: 340 }}
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search by user email..."
          />

          <button style={styles.btnGhost} onClick={loadRequests} type="button">
            Search
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
                        {r.tx_no}{" "}
                        {locked ? <span style={{ marginLeft: 8, ...styles.lockBadge }}>LOCKED</span> : null}
                      </div>
                      <div style={styles.small}>
                        <b>{r.user_email}</b> • {r.user_name || "-"} • Coins: <b>{r.coins}</b> • Money:{" "}
                        <b>
                          {Number(r.money_amount).toFixed(2)} {r.currency}
                        </b>
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
                        <b>Sender:</b> {r.sender_name} • {r.sender_bank_name} • {r.sender_account_number}
                      </div>
                      <div>
                        <b>Created:</b> {new Date(r.created_at).toLocaleString()}
                      </div>
                      {r.locked_at ? (
                        <div>
                          <b>Locked at:</b> {new Date(r.locked_at).toLocaleString()}
                        </div>
                      ) : null}

                      <button style={styles.actionBtn} onClick={() => viewProof(r.proof_path)} type="button">
                        View Screenshot
                      </button>

                      <div style={{ marginTop: 10 }}>
                        <b>Admin Note (optional):</b>
                        <input
                          style={{ ...styles.input, marginTop: 8 }}
                          value={adminNote[r.tx_no] ?? r.admin_note ?? ""}
                          onChange={(e) => setAdminNote((p) => ({ ...p, [r.tx_no]: e.target.value }))}
                          placeholder="Write note..."
                          disabled={locked}
                        />
                      </div>

                      <div style={styles.row}>
                        {!locked ? (
                          <>
                            <button style={styles.btnGhost} onClick={() => setStatus(r.tx_no, "approved")} type="button">
                              Approve
                            </button>
                            <button style={styles.btnGhost} onClick={() => setStatus(r.tx_no, "rejected")} type="button">
                              Reject
                            </button>
                            <button style={styles.btnGhost} onClick={() => setStatus(r.tx_no, "pending")} type="button">
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
                        After approving, admin will manually add coins using Coins Management page (use note: {r.tx_no}).
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
