// src/pages/dashboard/Mining.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// --- Icons ---
const Icons = {
  Clock: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bolt: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Gift: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
};

export default function Mining({ goToTab }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayMined, setTodayMined] = useState(0);
  const [totalMined, setTotalMined] = useState(0);
  const [speed12h, setSpeed12h] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const MINING_DURATION_MS = 12 * 60 * 60 * 1000;

  // Live Clock & CSS Injection
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes swing { 0% { transform: rotate(0deg); } 50% { transform: rotate(-45deg); } 100% { transform: rotate(0deg); } }
      @keyframes popCoin { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-40px) scale(1); opacity: 0; } }
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
      
      .miner-arm { transform-origin: 80% 80%; }
      .mining-active .miner-arm { animation: swing 0.8s ease-in-out infinite; }
      .coin-particle { opacity: 0; }
      .mining-active .coin-particle { animation: popCoin 1.2s linear infinite; }
      .mining-active .coin-particle:nth-child(2) { animation-delay: 0.4s; }
      .mining-active .coin-particle:nth-child(3) { animation-delay: 0.8s; }
    `;
    document.head.appendChild(style);

    const t = setInterval(() => setNow(Date.now()), 100); // 10hz update for smooth decimals
    return () => {
      clearInterval(t);
      document.head.removeChild(style);
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
    },
    header: { marginBottom: "24px" },
    title: { margin: 0, fontSize: "24px", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em" },
    subtitle: { margin: "4px 0 0", color: "#64748b", fontSize: "14px", fontWeight: 500 },

    // Stats Grid
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    card: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    cardLabel: { fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" },
    cardValue: { fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "8px" },
    cardSub: { fontSize: "12px", color: "#94a3b8", marginTop: "4px" },

    // Mining Panel
    trackerPanel: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      borderRadius: "20px",
      padding: "24px",
      color: "white",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.4)",
    },
    
    // The Animation Scene
    sceneContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      height: "180px",
      position: "relative",
    },
    
    // Progress Bar
    barTrack: {
      height: "12px",
      background: "rgba(255,255,255,0.1)",
      borderRadius: "10px",
      position: "relative",
      overflow: "hidden",
      marginBottom: "16px",
      zIndex: 2,
    },
    barFill: (pct) => ({
      height: "100%",
      width: `${pct}%`,
      background: "linear-gradient(90deg, #fbbf24 0%, #d97706 100%)", // Gold colors for AIDLA
      borderRadius: "10px",
      transition: "width 0.1s linear",
    }),

    // Realtime Counter
    counterBox: {
      textAlign: "center",
      marginBottom: "24px",
      zIndex: 2,
      position: "relative",
    },
    counterLabel: { fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.6, marginBottom: "4px" },
    counterValue: { 
      fontSize: "36px", 
      fontWeight: 900, 
      color: "#fbbf24", // Gold
      fontFamily: "monospace", 
      textShadow: "0 0 20px rgba(251, 191, 36, 0.4)" 
    },

    // Actions
    actions: { display: "flex", gap: "12px", flexWrap: "wrap", zIndex: 2, position: "relative" },
    mainBtn: (disabled, claiming) => ({
      flex: 1,
      minWidth: "160px",
      padding: "16px",
      borderRadius: "12px",
      background: claiming ? "#10b981" : disabled ? "rgba(255,255,255,0.1)" : "#3b82f6",
      color: "white",
      border: "none",
      fontWeight: 800,
      fontSize: "16px",
      cursor: disabled && !claiming ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: claiming ? "0 4px 12px rgba(16, 185, 129, 0.3)" : disabled ? "none" : "0 4px 12px rgba(59, 130, 246, 0.4)",
      transition: "all 0.2s",
    }),
    secBtn: {
      padding: "16px 20px",
      borderRadius: "12px",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.1)",
      fontWeight: 600,
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
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

  const loadMiningStatus = async () => {
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return setLoading(false);

    const { data, error } = await supabase
      .from("user_profiles")
      .select(`today_mined, total_mined, mining_speed_per_12h, mining_started_at, mining_ends_at`)
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      setErrorMsg("Could not load mining data.");
    } else {
      setTodayMined(Number(data.today_mined || 0));
      setTotalMined(Number(data.total_mined || 0));
      setSpeed12h(Number(data.mining_speed_per_12h || 0));
      setStartedAt(data.mining_started_at ? new Date(data.mining_started_at).getTime() : null);
      setEndsAt(data.mining_ends_at ? new Date(data.mining_ends_at).getTime() : null);
    }
    setLoading(false);
  };

  useEffect(() => { loadMiningStatus(); }, []);

  const miningActive = useMemo(() => endsAt && now < endsAt, [now, endsAt]);
  const canClaim = useMemo(() => endsAt && now >= endsAt, [now, endsAt]);
  const remainingMs = useMemo(() => (!endsAt || now >= endsAt) ? 0 : endsAt - now, [endsAt, now]);
  
  const elapsedMs = useMemo(() => {
    if (!startedAt) return 0;
    const end = endsAt ?? (startedAt + MINING_DURATION_MS);
    return Math.max(0, Math.min(now, end) - startedAt);
  }, [startedAt, endsAt, now]);

  const progressPct = useMemo(() => {
    if (!startedAt) return 0;
    const pct = (elapsedMs / MINING_DURATION_MS) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [elapsedMs, startedAt]);

  // 🔥 Visual Logic: Show decimals to make it look "fast"
  const realtimeMined = useMemo(() => {
    if (!startedAt) return "0.0000";
    const coins = (speed12h * elapsedMs) / MINING_DURATION_MS;
    const capped = Math.max(0, Math.min(speed12h, coins));
    // If finished, show exact integer. If mining, show decimals for speed effect.
    return canClaim ? capped.toFixed(0) : capped.toFixed(5);
  }, [speed12h, elapsedMs, startedAt, canClaim]);

  const formatMs = (ms) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleMine = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc("start_mining_12h");
      if (error) throw error;
      await loadMiningStatus();
    } catch (e) { setErrorMsg("Failed to start mining."); }
    finally { setActionLoading(false); }
  };

  const handleClaim = async () => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc("claim_mining_12h");
      if (error) throw error;
      setStatusMsg(`Success! +${data?.claimed || 0} AIDLA coins added.`);
      await loadMiningStatus();
    } catch (e) { setErrorMsg("Failed to claim rewards."); }
    finally { setActionLoading(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Mining Station</h2>
        <p style={styles.subtitle}>Mine AIDLA coins in the cloud</p>
      </div>

      {/* Stats Grid */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <span style={styles.cardLabel}><Icons.Bolt /> Speed (12h)</span>
          <span style={styles.cardValue}>{speed12h}</span>
          <span style={styles.cardSub}>AIDLA per session</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}><Icons.Gift /> Today Mined</span>
          <span style={styles.cardValue}>{todayMined}</span>
          <span style={styles.cardSub}>Claimed today</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}><Icons.Clock /> Total Mined</span>
          <span style={styles.cardValue}>{totalMined}</span>
          <span style={styles.cardSub}>Lifetime earnings</span>
        </div>
      </div>

      {/* Main Mining Interface */}
      <div style={styles.trackerPanel}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 300, height: 300, background: "rgba(251, 191, 36, 0.1)", borderRadius: "50%", filter: "blur(60px)", zIndex: 1 }}></div>

        {/* --- ANIMATED MINER SCENE --- */}
        <div style={styles.sceneContainer} className={miningActive ? "mining-active" : ""}>
            <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                {/* Floor */}
                <path d="M20 140 H180" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
                
                {/* Ore/Rock */}
                <path d="M120 140 Q130 110 160 140" fill="#475569" />
                <path d="M130 140 L135 125 L150 130 L160 140 Z" fill="#64748b"/>
                
                {/* Miner Body */}
                <circle cx="80" cy="70" r="12" fill="#e2e8f0" /> {/* Head */}
                <path d="M80 82 L80 110 L65 140 M80 110 L95 140" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" /> {/* Legs */}
                <path d="M80 82 L80 110" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" /> {/* Torso */}

                {/* Miner Arm with Pickaxe (Group for Animation) */}
                <g className="miner-arm" style={{ transformBox: "fill-box" }}>
                   {/* Arm */}
                   <path d="M80 90 L110 100" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                   {/* Pickaxe Handle */}
                   <line x1="100" y1="90" x2="135" y2="125" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                   {/* Pickaxe Head */}
                   <path d="M130 115 Q135 125 145 120 L150 125 Q135 140 120 135 Z" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" />
                </g>

                {/* Flying AIDLA Coins (Particles) */}
                <g transform="translate(135, 125)">
                   <circle className="coin-particle" cx="0" cy="0" r="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                   <text className="coin-particle" x="-2" y="2" fontSize="6" fill="#78350f" fontWeight="bold">A</text>
                </g>
                <g transform="translate(145, 130)">
                   <circle className="coin-particle" cx="0" cy="0" r="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                </g>
                <g transform="translate(140, 110)">
                   <circle className="coin-particle" cx="0" cy="0" r="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                </g>
            </svg>
        </div>

        {/* Realtime Counter with Decimals */}
        <div style={styles.counterBox}>
           <div style={styles.counterLabel}>AIDLA Coins</div>
           <div style={styles.counterValue}>
             {realtimeMined}
           </div>
        </div>

        {/* Progress Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px", color: "#94a3b8" }}>
          <span>Progress</span>
          <span>{endsAt ? (miningActive ? formatMs(remainingMs) : "Finished") : "12h Session"}</span>
        </div>
        <div style={styles.barTrack}>
           <div style={styles.barFill(progressPct)} />
        </div>

        {/* Buttons */}
        <div style={styles.actions}>
          {!endsAt ? (
             <button style={styles.mainBtn(actionLoading, false)} onClick={handleMine} disabled={actionLoading}>
               {actionLoading ? "Initializing..." : "Start Mining Session"}
             </button>
          ) : miningActive ? (
             <button style={styles.mainBtn(true, false)} disabled>
               Mining in progress...
             </button>
          ) : canClaim ? (
             <button style={styles.mainBtn(actionLoading, true)} onClick={handleClaim} disabled={actionLoading}>
               {actionLoading ? "Claiming..." : `Claim ${speed12h} AIDLA`}
             </button>
          ) : null}

          <button style={styles.secBtn} onClick={() => goToTab && goToTab('refer')}>
             <Icons.Star /> Earn More
          </button>
        </div>

        {/* Notifications */}
        {statusMsg && <div style={{...styles.alert("success"), marginTop: "16px", position: "relative", zIndex: 2}}><Icons.Check /> {statusMsg}</div>}
        {errorMsg && <div style={{...styles.alert("error"), marginTop: "16px", position: "relative", zIndex: 2}}>{errorMsg}</div>}
      </div>
    </div>
  );
}