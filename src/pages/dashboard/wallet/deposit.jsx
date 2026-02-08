// src/pages/dashboard/wallet/deposit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

// --- Icons ---
const Icons = {
  Bank: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  ),
  Upload: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Exchange: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Info: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// --- Reusable Input Component ---
const InputField = ({ label, value, onChange, placeholder, type = "text", min, step, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 14px",
          paddingRight: icon ? "36px" : "14px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          background: "#ffffff",
          color: "#0f172a",
          fontWeight: 600,
          fontSize: "14px",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
        onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
      />
      {icon && (
        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
          {icon}
        </div>
      )}
    </div>
  </div>
);

// --- Skeleton Loader ---
const Skeleton = ({ height, style }) => (
  <div style={{
    height,
    background: "#e2e8f0",
    borderRadius: "8px",
    animation: "pulse 1.5s infinite",
    width: "100%",
    ...style
  }} />
);

export default function Deposit() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);

  // Form State
  const [coins, setCoins] = useState("");
  const [money, setMoney] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [file, setFile] = useState(null);

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const price = useMemo(() => Number(settings?.coin_price || 0), [settings]);
  const currency = settings?.currency || "AED";

  // --- Styles ---
  const styles = {
    container: {
      width: "100%",
      boxSizing: "border-box",
      animation: "fadeIn 0.4s ease-out",
    },
    headerRow: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      marginBottom: "20px",
    },
    title: { margin: 0, fontSize: "20px", fontWeight: 800, color: "#1e293b" },
    
    // Rate Badge
    rateBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 12px",
      borderRadius: "20px",
      background: "#eff6ff",
      border: "1px solid #dbeafe",
      color: "#2563eb",
      fontSize: "13px",
      fontWeight: 700,
    },

    // Admin Bank Card (Business Card Style)
    bankCard: {
      background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      borderRadius: "16px",
      padding: "24px",
      color: "white",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      marginBottom: "24px",
      position: "relative",
      overflow: "hidden",
    },
    bankCardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "20px",
      position: "relative",
      zIndex: 2,
    },
    bankLabel: { fontSize: "12px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" },
    bankName: { fontSize: "20px", fontWeight: 700, margin: "4px 0 0" },
    bankGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      position: "relative",
      zIndex: 2,
    },
    bankDetailItem: { display: "flex", flexDirection: "column" },
    bankValue: { fontSize: "15px", fontWeight: 600, fontFamily: "monospace" }, // Monospace for numbers
    bankInstruction: {
      marginTop: "16px",
      paddingTop: "16px",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      fontSize: "13px",
      opacity: 0.9,
      lineHeight: 1.5,
      position: "relative",
      zIndex: 2,
    },
    bankDecor: {
      position: "absolute",
      bottom: "-20px",
      right: "-20px",
      width: "150px",
      height: "150px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "50%",
      zIndex: 1,
    },

    // Main Form Section
    formSection: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    
    // Calculator Area
    calcBox: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "20px",
    },
    calcGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 40px 1fr",
      alignItems: "center",
      gap: "10px",
    },
    calcIcon: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#94a3b8",
      marginTop: "20px", // Align with input
    },

    // Sender Info Grid
    senderGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "16px",
    },

    // File Upload
    uploadZone: (hasFile) => ({
      border: hasFile ? "2px solid #10b981" : "2px dashed #cbd5e1",
      borderRadius: "12px",
      padding: "24px",
      textAlign: "center",
      cursor: "pointer",
      background: hasFile ? "#ecfdf5" : "#ffffff",
      transition: "all 0.2s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
    }),
    uploadText: { fontSize: "14px", color: "#64748b", fontWeight: 500 },
    
    // Submit Button
    submitBtn: {
      width: "100%",
      padding: "14px",
      borderRadius: "12px",
      background: submitting ? "#94a3b8" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      color: "white",
      fontWeight: 700,
      fontSize: "15px",
      border: "none",
      cursor: submitting ? "not-allowed" : "pointer",
      boxShadow: submitting ? "none" : "0 4px 12px rgba(37, 99, 235, 0.2)",
      transition: "transform 0.1s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },

    // Alerts
    alert: (type) => ({
      marginTop: "16px",
      padding: "12px 16px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 600,
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      color: type === "error" ? "#991b1b" : "#166534",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),
  };

  // --- Effects & Logic ---
  useEffect(() => {
    // Add pulse keyframes
    const style = document.createElement("style");
    style.innerHTML = `@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`;
    document.head.appendChild(style);
    
    const mq = window.matchMedia("(max-width: 600px)");
    const handleResize = () => {
      // Force re-render if needed or adjust styles via CSS logic
    };
    window.addEventListener('resize', handleResize);

    loadSettings();
    return () => {
      document.head.removeChild(style);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase.rpc("get_payment_settings");
      if (error) throw error;
      setSettings(data);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load payment settings.");
    } finally {
      setLoading(false);
    }
  };

  const onCoinsChange = (v) => {
    setCoins(v);
    const c = Number(v);
    if (!price || !c || c <= 0) {
      setMoney("");
      return;
    }
    setMoney((c * price).toFixed(2));
  };

  const onMoneyChange = (v) => {
    setMoney(v);
    const m = Number(v);
    if (!price || !m || m <= 0) {
      setCoins("");
      return;
    }
    setCoins(Math.floor(m / price).toString());
  };

  const validate = () => {
    if (!settings) return "Payment settings not loaded.";
    if (!price || price <= 0) return "Configuration error: Coin price not set.";
    if (!Number(coins) || Number(coins) <= 0) return "Please enter a valid coin amount.";
    if (!senderName.trim()) return "Sender Name is required.";
    if (!senderBank.trim()) return "Sender Bank Name is required.";
    if (!senderAccount.trim()) return "Sender Account Number is required.";
    if (!file) return "Payment screenshot proof is required.";
    return null;
  };

  const uploadProof = async (userId, txTemp) => {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const safeExt = ["png", "jpg", "jpeg", "webp", "pdf"].includes(ext) ? ext : "png";
    const path = `deposits/${userId}/${txTemp}-${Date.now()}.${safeExt}`;
    const { error } = await supabase.storage.from("payment_proofs").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return path;
  };

  const submit = async () => {
    setErrorMsg("");
    setStatusMsg("");
    const vErr = validate();
    if (vErr) {
      setErrorMsg(vErr);
      return;
    }

    setSubmitting(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error("Not logged in.");

      const proofPath = await uploadProof(authData.user.id, "deposit");
      const { data, error } = await supabase.rpc("create_deposit_request", {
        p_coins: Math.floor(Number(coins)),
        p_money_amount: Number(money),
        p_sender_name: senderName,
        p_sender_bank_name: senderBank,
        p_sender_account_number: senderAccount,
        p_proof_path: proofPath,
      });

      if (error) throw error;
      setStatusMsg(`Deposit request submitted successfully! Transaction No: ${data.tx_no}`);
      setCoins("");
      setMoney("");
      setSenderName("");
      setSenderBank("");
      setSenderAccount("");
      setFile(null);
    } catch (e) {
      setErrorMsg(e?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div style={styles.container}>
        <Skeleton height="30px" style={{ width: "150px", marginBottom: 20 }} />
        <Skeleton height="200px" style={{ marginBottom: 20 }} />
        <Skeleton height="60px" style={{ marginBottom: 10 }} />
        <Skeleton height="60px" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={styles.container}>
        <div style={styles.alert("error")}>Could not load payment settings. Please try again later.</div>
      </div>
    );
  }

  // Check if screen is narrow for calc grid layout
  const isNarrow = window.innerWidth < 600;

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Deposit Funds</h3>
        <div style={styles.rateBadge}>
           <span>Current Rate:</span>
           <strong>1 Coin = {Number(settings.coin_price).toFixed(2)} {currency}</strong>
        </div>
      </div>

      {/* Admin Bank Details Card */}
      <div style={styles.bankCard}>
        <div style={styles.bankDecor} />
        <div style={styles.bankCardHeader}>
          <div>
            <div style={styles.bankLabel}>Bank Name</div>
            <div style={styles.bankName}>{settings.bank_name || "Bank Name Not Set"}</div>
          </div>
          <div style={{ opacity: 0.8 }}><Icons.Bank /></div>
        </div>

        <div style={styles.bankGrid}>
          <div style={styles.bankDetailItem}>
            <span style={styles.bankLabel}>Account Title</span>
            <span style={{ fontSize: "16px", fontWeight: 600 }}>{settings.account_title || "—"}</span>
          </div>
          <div style={styles.bankDetailItem}>
            <span style={styles.bankLabel}>Account Number</span>
            <span style={styles.bankValue}>{settings.account_number || "—"}</span>
          </div>
          <div style={styles.bankDetailItem}>
            <span style={styles.bankLabel}>IBAN / SWIFT</span>
            <span style={styles.bankValue}>{settings.iban || settings.swift_code || "—"}</span>
          </div>
        </div>

        {settings.instructions && (
          <div style={styles.bankInstruction}>
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              <Icons.Info /> <strong>Instructions:</strong>
            </div>
             {settings.instructions}
          </div>
        )}
      </div>

      {/* Input Form */}
      <div style={styles.formSection}>
        
        {/* Converter / Calculator */}
        <div style={styles.calcBox}>
           <div style={{...styles.calcGrid, gridTemplateColumns: isNarrow ? '1fr' : '1fr 40px 1fr'}}>
              <InputField 
                label="Coins You Want" 
                value={coins} 
                onChange={(e) => onCoinsChange(e.target.value)} 
                type="number"
                placeholder="1000"
                step="1"
              />
              <div style={styles.calcIcon}>
                 {isNarrow ? "↓" : <Icons.Exchange />}
              </div>
              <InputField 
                label={`Amount to Pay (${currency})`} 
                value={money} 
                onChange={(e) => onMoneyChange(e.target.value)} 
                type="number"
                placeholder="0.00"
                step="0.01"
              />
           </div>
        </div>

        {/* Sender Info */}
        <div style={styles.senderGrid}>
          <InputField 
            label="Sender Name" 
            value={senderName} 
            onChange={(e) => setSenderName(e.target.value)} 
            placeholder="Account Holder Name"
          />
          <InputField 
            label="Sender Bank" 
            value={senderBank} 
            onChange={(e) => setSenderBank(e.target.value)} 
            placeholder="Bank Name"
          />
          <InputField 
            label="Sender Account No" 
            value={senderAccount} 
            onChange={(e) => setSenderAccount(e.target.value)} 
            placeholder="Last 4 digits or full number"
          />
        </div>

        {/* File Upload */}
        <div style={{ minWidth: 0 }}>
          <label 
            style={styles.uploadZone(!!file)}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.99)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
            {file ? (
              <>
                <div style={{ color: "#10b981" }}><Icons.Check /></div>
                <div>
                  <div style={{ fontWeight: 700, color: "#064e3b" }}>File Selected</div>
                  <div style={{ fontSize: "13px", color: "#065f46" }}>{file.name}</div>
                </div>
                <div style={{ fontSize: "12px", color: "#059669", textDecoration: "underline" }}>Change File</div>
              </>
            ) : (
              <>
                <div style={{ color: "#64748b" }}><Icons.Upload /></div>
                <div style={styles.uploadText}>
                  <strong>Click to upload</strong> proof of payment
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Screenshot or PDF Receipt</div>
              </>
            )}
          </label>
        </div>

        {/* Action Buttons */}
        <button 
          style={styles.submitBtn} 
          onClick={submit} 
          disabled={submitting}
          onMouseDown={(e) => !submitting && (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => !submitting && (e.currentTarget.style.transform = "scale(1)")}
        >
          {submitting ? "Processing Request..." : "Submit Deposit Request"}
        </button>

        {/* Messages */}
        {errorMsg && <div style={styles.alert("error")}>{errorMsg}</div>}
        {statusMsg && <div style={styles.alert("success")}><Icons.Check /> {statusMsg}</div>}

      </div>
    </div>
  );
}