// src/pages/dashboard/Wallet.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// Sub-pages (tabs)
import WalletOverview from "../dashboard/wallet/WalletOverview";
import Deposit from "../dashboard/wallet/deposit";
import Withdraw from "../dashboard/wallet/withdraw";
import Transactions from "../dashboard/wallet/transactions";
import RequestsHistory from "../dashboard/wallet/RequestsHistory";

// --- Icons (Embedded SVGs) ---
const Icons = {
  Wallet: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Minus: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Coin: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const Skeleton = ({ width, height }) => (
  <div
    style={{
      width,
      height,
      backgroundColor: "rgba(15, 23, 42, 0.08)",
      borderRadius: "6px",
      animation: "pulse 1.5s infinite ease-in-out",
    }}
  />
);

export default function Wallet() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [isTiny, setIsTiny] = useState(false);

  // ✅ responsive + animations (safe + production)
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(styleSheet);

    const mq = window.matchMedia("(max-width: 600px)");
    const onChange = () => setIsTiny(mq.matches);
    onChange();

    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
      document.head.removeChild(styleSheet);
    };
  }, []);

  const loadCoins = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        setCoins(0);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("aidla_coins")
        .eq("user_id", user.id)
        .single();

      if (!error) setCoins(Number(data?.aidla_coins || 0));
      else setCoins(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoins();
  }, []);

  const tabs = useMemo(
    () => [
      { key: "overview", label: "Overview", icon: <Icons.Wallet /> },
      { key: "deposit", label: "Deposit", icon: <Icons.Plus /> },
      { key: "withdraw", label: "Withdraw", icon: <Icons.Minus /> },
      { key: "transactions", label: "Transactions", icon: <Icons.List /> },
      { key: "history", label: "History", icon: <Icons.Clock /> },
    ],
    []
  );

  const activeLabel = useMemo(() => tabs.find((t) => t.key === activeTab)?.label || "Wallet", [tabs, activeTab]);

  const renderTab = () => (
    <div key={activeTab} style={{ animation: "fadeIn 0.25s ease-out", width: "100%", minWidth: 0 }}>
      {(() => {
        switch (activeTab) {
          case "overview":
            return <WalletOverview coins={coins} refreshWallet={loadCoins} />;
          case "deposit":
            return <Deposit />;
          case "withdraw":
            return <Withdraw />;
          case "transactions":
            return <Transactions />;
          case "history":
            return <RequestsHistory />;
          default:
            return <WalletOverview coins={coins} refreshWallet={loadCoins} />;
        }
      })()}
    </div>
  );

  // ✅ IMPORTANT: Dashboard already provides white card + background.
  // So this component should NOT add extra page padding/background (prevents narrow-center bug).
  const styles = {
    page: {
      width: "100%",
      minHeight: "auto",
      padding: 0,
      margin: 0,
      boxSizing: "border-box",
      background: "transparent",
      backgroundImage: "none",
      overflowX: "hidden",
      minWidth: 0,
    },
    wrap: {
      width: "100%",
      maxWidth: "100%",
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "clamp(14px, 2.2vw, 22px)",
      minWidth: 0,
      boxSizing: "border-box",
    },

    // Header Area (fits inside Dashboard content card)
    topBar: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
      borderRadius: 16,
      padding: "clamp(12px, 2.2vw, 16px) clamp(12px, 2.6vw, 18px)",
      border: "1px solid rgba(226,232,240,0.9)",
      boxShadow: "0 6px 16px rgba(15, 23, 42, 0.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
    },
    titleBlock: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
    title: {
      margin: 0,
      fontSize: "clamp(18px, 2.6vw, 24px)",
      fontWeight: 900,
      color: "#0f172a",
      letterSpacing: "-0.02em",
    },
    subtitle: {
      margin: 0,
      color: "#64748b",
      fontWeight: 600,
      fontSize: 13,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: "100%",
    },

    // Coin Badge
    coinBadge: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 14px",
      borderRadius: 14,
      background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
      color: "#ffffff",
      boxShadow: "0 6px 18px rgba(59, 130, 246, 0.25)",
      border: "1px solid rgba(255,255,255,0.18)",
      minWidth: 0,
      boxSizing: "border-box",
    },
    coinLabel: {
      fontSize: 11,
      fontWeight: 800,
      opacity: 0.9,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
    },
    coinValue: {
      fontSize: 14,
      fontWeight: 900,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: isTiny ? 160 : 240,
    },

    // Tabs
    navCard: {
      width: "100%",
      background: "white",
      borderRadius: 16,
      padding: 6,
      border: "1px solid #e2e8f0",
      boxShadow: "0 6px 14px rgba(15, 23, 42, 0.04)",
      display: "grid",
      gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, // ✅ no overflow
      gap: 6,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
    },
    tabBtn: (active) => ({
      minWidth: 0,
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: isTiny ? 0 : 8,
      padding: isTiny ? "12px 0" : "10px 12px",
      borderRadius: 12,
      border: "1px solid transparent",
      background: active ? "rgba(15, 23, 42, 0.04)" : "transparent",
      color: active ? "#0f172a" : "#64748b",
      cursor: "pointer",
      transition: "transform 0.12s ease, background 0.2s ease, color 0.2s ease",
      position: "relative",
      overflow: "hidden",
    }),
    tabText: (active) => ({
      fontSize: 13,
      fontWeight: active ? 800 : 600,
      display: isTiny ? "none" : "block",
      minWidth: 0,
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    mobileLabel: { textAlign: "center", marginTop: 8, marginBottom: -10 },
    mobilePill: {
      display: "inline-block",
      background: "#e2e8f0",
      color: "#475569",
      padding: "4px 12px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    // Panel (inside dashboard content card)
    panel: {
      width: "100%",
      background: "white",
      borderRadius: 16,
      border: "1px solid #e2e8f0",
      padding: "clamp(12px, 2.4vw, 18px)",
      boxShadow: "0 10px 18px rgba(15, 23, 42, 0.03)",
      minHeight: 280,
      position: "relative",
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {/* Top Header & Balance */}
        <div style={styles.topBar}>
          <div style={styles.titleBlock}>
            <h2 style={styles.title}>Wallet</h2>
            <p style={styles.subtitle}>Manage your AIDLA balance</p>
          </div>

          <div style={styles.coinBadge}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 0 }}>
              <span style={styles.coinLabel}>Balance</span>
              {loading ? <Skeleton width="90px" height="18px" /> : <span style={styles.coinValue}>{coins.toLocaleString()} AIDLA</span>}
            </div>

            <div style={{ background: "rgba(255,255,255,0.18)", padding: 6, borderRadius: "50%", flex: "0 0 auto" }}>
              <Icons.Coin />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div>
          <div style={styles.navCard}>
            {tabs.map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  style={styles.tabBtn(active)}
                  onClick={() => setActiveTab(t.key)}
                  type="button"
                  title={t.label}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <span style={{ color: active ? "#4f46e5" : "inherit", flex: "0 0 auto" }}>{t.icon}</span>
                  <span style={styles.tabText(active)}>{t.label}</span>

                  {/* Active Indicator Line (Desktop) */}
                  {active && !isTiny && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -4,
                        left: "18%",
                        right: "18%",
                        height: 3,
                        background: "#4f46e5",
                        borderRadius: 2,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Active Label Indicator */}
          {isTiny && (
            <div style={styles.mobileLabel}>
              <span style={styles.mobilePill}>{activeLabel}</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={styles.panel}>{renderTab()}</div>
      </div>
    </div>
  );
}
