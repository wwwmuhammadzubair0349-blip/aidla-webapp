// src/pages/dashboard/ReferFriend.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// --- Icons ---
const Icons = {
  Copy: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Share: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  Link: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Trophy: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
};

// --- Skeleton Loader ---
const Skeleton = ({ height, width, style }) => (
  <div style={{ height, width: width || "100%", background: "#f1f5f9", borderRadius: "8px", animation: "pulse 1.5s infinite", ...style }} />
);

export default function ReferFriend() {
  const [loading, setLoading] = useState(true);
  const [myCode, setMyCode] = useState("");
  const [totalReferred, setTotalReferred] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Interaction states for buttons
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Responsive check
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Inject animation styles
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    const mq = window.matchMedia("(max-width: 480px)");
    const handleResize = () => setIsMobile(mq.matches);
    handleResize();
    mq.addEventListener("change", handleResize);

    return () => {
      document.head.removeChild(style);
      mq.removeEventListener("change", handleResize);
    };
  }, []);

  const styles = {
    container: {
      width: "100%",
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "20px",
      boxSizing: "border-box",
      animation: "fadeIn 0.4s ease-out",
      minWidth: 0, // Flex fix
    },
    header: { marginBottom: "24px" },
    title: { margin: 0, fontSize: "24px", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em" },
    subtitle: { margin: "4px 0 0", color: "#64748b", fontSize: "14px", fontWeight: 500 },

    // Hero Section (Code Display)
    heroCard: {
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      borderRadius: "20px",
      padding: "30px",
      color: "white",
      marginBottom: "24px",
      textAlign: "center",
      boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
    },
    heroTitle: { fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9, marginBottom: "12px", fontWeight: 600 },
    codeBox: {
      background: "rgba(255, 255, 255, 0.2)",
      border: "2px dashed rgba(255, 255, 255, 0.4)",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "28px",
      fontWeight: 900,
      letterSpacing: "4px",
      marginBottom: "24px",
      fontFamily: "monospace",
      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
      wordBreak: "break-all", // Safety for small screens
    },
    
    // Action Buttons Row
    actionRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    actionBtn: (primary) => ({
      flex: isMobile ? "1 1 100%" : "0 1 auto",
      padding: "12px 20px",
      borderRadius: "10px",
      border: "none",
      background: primary ? "white" : "rgba(255, 255, 255, 0.1)",
      color: primary ? "#4f46e5" : "white",
      fontWeight: 700,
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "transform 0.1s ease, background 0.2s",
      boxShadow: primary ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
    }),

    // Stats Grid
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    statCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
    },
    iconCircle: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      background: "#f1f5f9",
      color: "#475569",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    statContent: { display: "flex", flexDirection: "column" },
    statLabel: { fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
    statValue: { fontSize: "20px", fontWeight: 800, color: "#0f172a" },
    statHint: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },

    // How it works text
    infoText: {
      textAlign: "center",
      fontSize: "13px",
      color: "#64748b",
      lineHeight: 1.6,
      maxWidth: "500px",
      margin: "0 auto",
      background: "#f8fafc",
      padding: "16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
    },

    alert: (type) => ({
      marginTop: "16px",
      padding: "12px 16px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: 600,
      background: type === "error" ? "#fee2e2" : "#d1fae5",
      color: type === "error" ? "#991b1b" : "#065f46",
      border: `1px solid ${type === "error" ? "#fecaca" : "#a7f3d0"}`,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),
  };

  const signupLink = useMemo(() => {
    if (!myCode) return "";
    return `${window.location.origin}/signup?ref=${encodeURIComponent(myCode)}`;
  }, [myCode]);

  const loadMyReferral = async () => {
    setLoading(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) throw new Error("Not logged in.");

      const { data, error } = await supabase
        .from("user_profiles")
        .select("my_ref_code, total_referred_by_me, total_earned_from_referrals")
        .eq("user_id", authData.user.id)
        .single();

      if (error) throw error;

      setMyCode(data?.my_ref_code || "");
      setTotalReferred(Number(data?.total_referred_by_me || 0));
      setTotalEarned(Number(data?.total_earned_from_referrals || 0));
    } catch (e) {
      setErrorMsg(e?.message || "Could not load referral data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMyReferral(); }, []);

  const copyText = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      setStatusMsg("");
    } catch {
      setErrorMsg("Copy failed. Please copy manually.");
    }
  };

  const shareLink = async () => {
    if (!signupLink) return;
    const shareData = {
      title: "Join AIDLA",
      text: `Join AIDLA using my referral code: ${myCode} and earn rewards!`,
      url: signupLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      copyText(signupLink, 'link');
      setStatusMsg("Link copied to clipboard ✅");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Skeleton height="32px" width="150px" />
          <Skeleton height="16px" width="200px" style={{marginTop: 8}} />
        </div>
        <Skeleton height="200px" style={{ borderRadius: "20px", marginBottom: "24px" }} />
        <div style={styles.grid}>
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Referrals</h2>
        <p style={styles.subtitle}>Invite friends and earn together</p>
      </div>

      {/* Hero Card */}
      <div style={styles.heroCard}>
        <div style={styles.heroTitle}>Your Unique Referral Code</div>
        <div style={styles.codeBox}>{myCode || "---"}</div>
        
        <div style={styles.actionRow}>
          <button 
            style={styles.actionBtn(true)} 
            onClick={() => copyText(myCode, 'code')}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {copiedCode ? <Icons.Check /> : <Icons.Copy />} 
            {copiedCode ? "Copied!" : "Copy Code"}
          </button>

          <button 
            style={styles.actionBtn(false)} 
            onClick={() => copyText(signupLink, 'link')}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {copiedLink ? <Icons.Check /> : <Icons.Link />}
            {copiedLink ? "Link Copied" : "Copy Link"}
          </button>

          <button 
            style={styles.actionBtn(false)} 
            onClick={shareLink}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <Icons.Share /> Share
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={styles.grid}>
        <div style={styles.statCard}>
          <div style={styles.iconCircle}><Icons.Users /></div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Friends Invited</span>
            <span style={styles.statValue}>{totalReferred}</span>
            <span style={styles.statHint}>Registered users</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.iconCircle}><Icons.Trophy /></div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Total Earned</span>
            <span style={styles.statValue}>{totalEarned}</span>
            <span style={styles.statHint}>AIDLA Coins reward</span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div style={styles.infoText}>
        <strong>How it works:</strong> Share your referral link or code. When a friend signs up using it, you instantly earn bonus AIDLA coins and they get a head start!
      </div>

      {/* Feedback Messages */}
      {statusMsg && <div style={styles.alert("success")}>{statusMsg}</div>}
      {errorMsg && <div style={styles.alert("error")}>{errorMsg}</div>}
    </div>
  );
}