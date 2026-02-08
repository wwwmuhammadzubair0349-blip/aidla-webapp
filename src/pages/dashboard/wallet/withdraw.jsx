// src/pages/dashboard/wallet/withdraw.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

// --- Icons ---
const Icons = {
  Wallet: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  Bank: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Hash: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  ),
  Globe: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
};

// --- Reusable Input (FIXED: no overflow on small screens) ---
const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  error,
  action,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minWidth: 0 }}>
      <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em", minWidth: 0 }}>
        {label}
      </label>
      {action}
    </div>

    <div style={{ position: "relative", minWidth: 0 }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={type === "number" ? "numeric" : undefined}
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          padding: "12px 14px",
          paddingRight: icon ? 44 : 14,
          borderRadius: 10,
          border: error ? "1px solid #ef4444" : "1px solid #cbd5e1",
          background: error ? "#fef2f2" : "#ffffff",
          color: "#0f172a",
          fontWeight: 700,
          fontSize: 14,
          outline: "none",
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = "#6366f1";
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = "#cbd5e1";
        }}
      />

      {icon && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      )}
    </div>

    {error && <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>{error}</span>}
  </div>
);

export default function Withdraw() {
  const [coins, setCoins] = useState("");
  const [payoutBank, setPayoutBank] = useState("");
  const [payoutTitle, setPayoutTitle] = useState("");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [payoutIban, setPayoutIban] = useState("");

  const [availableCoins, setAvailableCoins] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isTiny, setIsTiny] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 520px)");
    const onChange = () => setIsTiny(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const styles = {
    container: {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      overflowX: "hidden", // ✅ hard stop for any stray overflow
    },

    headerRow: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 16,
      minWidth: 0,
    },
    title: { margin: 0, fontSize: 20, fontWeight: 900, color: "#0f172a" },

    // Balance Display (responsive padding)
    balanceCard: {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
      borderRadius: 16,
      padding: isTiny ? "14px 14px" : "18px 20px",
      color: "white",
      boxShadow: "0 8px 20px rgba(59, 130, 246, 0.22)",
      marginBottom: 16,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      overflow: "hidden",
    },
    balanceLabel: { fontSize: 12, opacity: 0.9, fontWeight: 700, marginBottom: 4, letterSpacing: "0.02em" },
    balanceValue: { fontSize: isTiny ? 20 : 24, fontWeight: 900, lineHeight: 1.1 },

    // Form
    formCard: {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      padding: isTiny ? 14 : 18,
      boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
      overflow: "hidden", // ✅ prevents right-side spill
    },
    grid: {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      display: "grid",
      gridTemplateColumns: isTiny ? "1fr" : "repeat(2, minmax(0, 1fr))", // ✅ NO min 240
      gap: 14,
      marginBottom: 16,
    },

    // Submit
    submitBtn: {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      padding: "14px",
      borderRadius: 12,
      background: submitting ? "#94a3b8" : "#0f172a",
      color: "white",
      fontWeight: 900,
      fontSize: 15,
      border: "none",
      cursor: submitting ? "not-allowed" : "pointer",
      boxShadow: submitting ? "none" : "0 8px 18px rgba(15, 23, 42, 0.14)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    alert: (type) => ({
      marginTop: 12,
      padding: "12px 14px",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 800,
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      color: type === "error" ? "#991b1b" : "#166534",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
      wordBreak: "break-word",
    }),

    maxBtn: {
      fontSize: 11,
      color: "#2563eb",
      fontWeight: 900,
      background: "rgba(37, 99, 235, 0.10)",
      padding: "4px 10px",
      borderRadius: 999,
      cursor: "pointer",
      border: "1px solid rgba(37, 99, 235, 0.18)",
      flex: "0 0 auto",
    },
  };

  const loadBalance = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("aidla_coins")
        .eq("user_id", user.id)
        .single();

      if (!error) setAvailableCoins(Number(data?.aidla_coins || 0));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const handleMax = () => {
    if (availableCoins !== null) setCoins(String(availableCoins));
  };

  const submit = async () => {
    setErrorMsg("");
    setStatusMsg("");

    const c = Math.floor(Number(coins));
    if (!c || c <= 0) return setErrorMsg("Enter a valid amount of coins to withdraw.");

    if (!payoutBank.trim() || !payoutTitle.trim() || !payoutAccount.trim()) {
      return setErrorMsg("Fill Bank Name, Account Title, and Account Number.");
    }

    if (availableCoins !== null && c > availableCoins) {
      return setErrorMsg(`Insufficient balance. Available: ${availableCoins} coins.`);
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("create_withdraw_request", {
        p_coins: c,
        p_payout_method: "bank",
        p_payout_bank_name: payoutBank.trim(),
        p_payout_account_title: payoutTitle.trim(),
        p_payout_account_number: payoutAccount.trim(),
        p_payout_iban: payoutIban.trim() || null,
      });

      if (error) throw error;

      setStatusMsg(`Withdrawal request #${data?.tx_no ?? ""} submitted.`);
      setCoins("");
      setPayoutBank("");
      setPayoutTitle("");
      setPayoutAccount("");
      setPayoutIban("");
      await loadBalance();
    } catch (e) {
      setErrorMsg(e?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const exceeds = availableCoins !== null && Number(coins || 0) > availableCoins;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Withdraw</h3>
      </div>

      {/* Balance Highlight */}
      <div style={styles.balanceCard}>
        <div style={{ minWidth: 0 }}>
          <div style={styles.balanceLabel}>Available</div>
          <div style={styles.balanceValue}>
            {availableCoins === null ? "…" : availableCoins.toLocaleString()}{" "}
            <span style={{ fontSize: 12, fontWeight: 800, opacity: 0.95 }}>AIDLA</span>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.18)", padding: 10, borderRadius: 12, flex: "0 0 auto" }}>
          <Icons.Wallet />
        </div>
      </div>

      {/* Main Form */}
      <div style={styles.formCard}>
        <div style={{ marginBottom: 14 }}>
          <InputField
            label="Amount (Coins)"
            value={coins}
            onChange={(e) => setCoins(e.target.value)}
            type="number"
            placeholder="e.g. 100"
            icon={null}
            error={exceeds ? "Exceeds available balance" : null}
            action={
              <button onClick={handleMax} style={styles.maxBtn} type="button">
                MAX
              </button>
            }
          />
        </div>

        <div style={styles.grid}>
          <InputField
            label="Bank Name"
            value={payoutBank}
            onChange={(e) => setPayoutBank(e.target.value)}
            placeholder="e.g. Emirates NBD"
            icon={<Icons.Bank />}
          />
          <InputField
            label="Account Title"
            value={payoutTitle}
            onChange={(e) => setPayoutTitle(e.target.value)}
            placeholder="Account holder name"
            icon={<Icons.User />}
          />
          <InputField
            label="Account Number"
            value={payoutAccount}
            onChange={(e) => setPayoutAccount(e.target.value)}
            placeholder="0000 0000 0000"
            icon={<Icons.Hash />}
          />
          <InputField
            label="IBAN (Optional)"
            value={payoutIban}
            onChange={(e) => setPayoutIban(e.target.value)}
            placeholder="AE00..."
            icon={<Icons.Globe />}
          />
        </div>

        <button style={styles.submitBtn} onClick={submit} disabled={submitting} type="button">
          {submitting ? "Processing..." : (
            <>
              <Icons.Send /> Submit Withdrawal
            </>
          )}
        </button>

        {errorMsg && <div style={styles.alert("error")}>{errorMsg}</div>}
        {statusMsg && <div style={styles.alert("success")}>{statusMsg}</div>}
      </div>
    </div>
  );
}
