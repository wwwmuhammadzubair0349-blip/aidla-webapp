import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminCoinsManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [adminBalance, setAdminBalance] = useState(0);

  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null); // {full_name,email,aidla_coins}
  const [finding, setFinding] = useState(false);

  const [amount, setAmount] = useState("");
  const [txType, setTxType] = useState("admin_send");
  const [note, setNote] = useState("");

  const [recent, setRecent] = useState([]);

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const styles = {
    title: { margin: 0, fontSize: 20, fontWeight: 900 },
    sub: { marginTop: 6, color: "#6b7280", fontWeight: 700, lineHeight: 1.6 },
    card: {
      marginTop: 12,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 16,
    },
    topRow: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between" },
    pill: {
      display: "inline-block",
      padding: "8px 10px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 900,
      color: "#111827",
    },
    grid: {
      marginTop: 12,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 12,
    },
    field: {
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 12,
      background: "#f9fafb",
    },
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
    btnPrimary: {
      padding: "10px 12px",
      borderRadius: 12,
      border: 0,
      background: "#0d6efd",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
      opacity: saving ? 0.7 : 1,
    },
    btnGhost: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      color: "#111827",
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
      lineHeight: 1.5,
    },
    msgErr: {
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 12,
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#991b1b",
      fontWeight: 800,
      lineHeight: 1.5,
    },
    userBox: {
      marginTop: 10,
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: 12,
      background: "#fff",
    },
    small: { marginTop: 8, color: "#6b7280", fontSize: 13, lineHeight: 1.6 },

    tableWrap: {
      marginTop: 14,
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      overflow: "hidden",
      background: "#fff",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: 10, background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: 900 },
    td: { padding: 10, borderBottom: "1px solid #e5e7eb", verticalAlign: "top", fontWeight: 700, color: "#111827" },
    chip: (t) => ({
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background:
        t === "user_withdraw" ? "#ecfeff" :
        t === "user_deposit" ? "#fff7ed" :
        "#eef2ff",
      fontWeight: 900,
      fontSize: 12,
    }),
  };

  const loadAdminBalance = async () => {
    const { data, error } = await supabase.rpc("admin_get_coin_pool");
    if (error) throw error;
    setAdminBalance(Number(data || 0));
  };

  const loadRecent = async () => {
    const { data, error } = await supabase.rpc("admin_recent_coin_transactions", { p_limit: 20 });
    if (!error) setRecent(Array.isArray(data) ? data : []);
  };

  const loadAll = async () => {
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      await loadAdminBalance();
      await loadRecent();
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load admin coins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce email lookup
  useEffect(() => {
    const val = email.trim();
    if (!val || !val.includes("@")) {
      setFoundUser(null);
      return;
    }

    const t = setTimeout(async () => {
      setFinding(true);
      setErrorMsg("");
      try {
        const { data, error } = await supabase.rpc("admin_find_user_by_email", { p_email: val });
        if (error) throw error;

        if (data?.found) {
          setFoundUser({
            full_name: data.full_name,
            email: data.email,
            aidla_coins: Number(data.aidla_coins || 0),
          });
        } else {
          setFoundUser(null);
        }
      } catch (e) {
        setFoundUser(null);
        setErrorMsg(e?.message || "User lookup failed.");
      } finally {
        setFinding(false);
      }
    }, 450);

    return () => clearTimeout(t);
  }, [email]);

  const typeHelp = useMemo(() => {
    if (txType === "admin_send") {
      return "Admin → User (admin pool decreases, user wallet increases).";
    }
    if (txType === "user_deposit") {
      return "User Deposit (user buys coins): admin pool decreases, user wallet increases.";
    }
    return "User Withdraw: user wallet decreases, admin pool increases.";
  }, [txType]);

  const submit = async () => {
    setErrorMsg("");
    setStatusMsg("");

    const em = email.trim().toLowerCase();
    if (!em.includes("@")) {
      setErrorMsg("Enter a valid user email.");
      return;
    }
    if (!foundUser) {
      setErrorMsg("User not found. Enter correct email.");
      return;
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setErrorMsg("Enter a valid amount greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc("admin_process_coins", {
        p_user_email: em,
        p_amount: Math.floor(amt),
        p_tx_type: txType,
        p_note: note || null,
      });

      if (error) throw error;

      setStatusMsg(
        `Success ✅ ${data.tx_type} | ${data.amount} coins | ${data.user_name} (${data.user_email})`
      );

      // refresh
      await loadAll();

      // refresh found user balance (local)
      setFoundUser((prev) =>
        prev ? { ...prev, aidla_coins: Number(data.user_balance || prev.aidla_coins) } : prev
      );

      setAmount("");
      setNote("");
    } catch (e) {
      setErrorMsg(e?.message || "Transaction failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 style={styles.title}>Coins Management</h2>
        <p style={styles.sub}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h2 style={styles.title}>Coins Management</h2>
          <p style={styles.sub}>
            Admin coin pool + send/deposit/withdraw processing (secure via RPC).
          </p>
        </div>

        <div style={styles.pill}>Admin Coins: {adminBalance.toLocaleString()}</div>
      </div>

      <div style={styles.card}>
        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>User Email</label>
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
            <div style={styles.small}>
              {finding ? "Finding user..." : "Type email to auto-load user name."}
            </div>

            {foundUser ? (
              <div style={styles.userBox}>
                <div style={{ fontWeight: 900 }}>{foundUser.full_name || "Unnamed User"}</div>
                <div style={{ marginTop: 6, color: "#6b7280", fontWeight: 800 }}>
                  Wallet: {foundUser.aidla_coins.toLocaleString()} coins
                </div>
              </div>
            ) : email.trim().includes("@") && !finding ? (
              <div style={styles.userBox}>
                <div style={{ fontWeight: 900, color: "#991b1b" }}>User not found</div>
              </div>
            ) : null}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Transaction Type</label>
            <select style={styles.select} value={txType} onChange={(e) => setTxType(e.target.value)}>
              <option value="admin_send">Send Coins (Admin → User)</option>
              <option value="user_deposit">User Deposit (Admin → User)</option>
              <option value="user_withdraw">User Withdraw (User → Admin)</option>
            </select>
            <div style={styles.small}>{typeHelp}</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Amount (Coins)</label>
            <input
              style={styles.input}
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
            />
            <div style={styles.small}>
              For withdraw: user must have enough wallet coins. For send/deposit: admin must have enough pool.
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Note (optional)</label>
            <input
              style={styles.input}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. bonus, deposit payment ref, withdraw request id..."
            />
          </div>
        </div>

        <div style={styles.row}>
          <button style={styles.btnPrimary} onClick={submit} disabled={saving} type="button">
            {saving ? "Processing..." : "Submit Transaction"}
          </button>

          <button style={styles.btnGhost} onClick={loadAll} disabled={saving} type="button">
            Refresh
          </button>
        </div>

        {statusMsg ? <div style={styles.msgOk}>{statusMsg}</div> : null}
        {errorMsg ? <div style={styles.msgErr}>{errorMsg}</div> : null}

        {/* Recent transactions */}
        <div style={{ marginTop: 16, fontWeight: 900 }}>Recent Transactions</div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Admin Balance After</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan={5}>
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                recent.map((r) => (
                  <tr key={r.id}>
                    <td style={styles.td}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={styles.chip(r.tx_type)}>{r.tx_type}</span>
                      {r.note ? (
                        <div style={{ marginTop: 6, color: "#6b7280", fontWeight: 700 }}>
                          {r.note}
                        </div>
                      ) : null}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 900 }}>{r.user_email}</div>
                    </td>
                    <td style={styles.td}>{Number(r.amount).toLocaleString()}</td>
                    <td style={styles.td}>{Number(r.admin_balance_after).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.small}>
          This log will help you track all incoming/outgoing coins and match deposit/withdraw records later.
        </div>
      </div>
    </div>
  );
}
