import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Tabs (pages)
import Profile from "../pages/dashboard/profile";
import Wallet from "../pages/dashboard/wallet";
import Mining from "../pages/dashboard/mining";
import ReferFriend from "../pages/dashboard/ReferFriend";
import Learning from "../pages/dashboard/learning";
import Courses from "../pages/dashboard/courses";
import AidlaBot from "../pages/dashboard/aidlabot";
import Shop from "./shop/shop";

// Simple SVG Icons for the Menu
const IconMenu = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const IconClose = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Dashboard Statistics Component
const DashboardStats = ({ userStats, navigateToTab }) => {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Fetch recent activities
  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setLoadingActivities(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch mining activities
      const { data: miningData } = await supabase
        .from("mining_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch referral activities
      const { data: referralData } = await supabase
        .from("referral_history")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch learning activities
      const { data: learningData } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      // Format activities
      const formattedActivities = [
        ...(miningData?.map(session => ({
          type: 'mining',
          text: `Mining session completed: +${session.coins_earned} coins`,
          time: new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: '⛏️'
        })) || []),
        ...(referralData?.map(ref => ({
          type: 'referral',
          text: `New referral: ${ref.referred_email}`,
          time: new Date(ref.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: '👥'
        })) || []),
        ...(learningData?.map(progress => ({
          type: 'learning',
          text: `Completed: ${progress.course_name || 'Lesson'}`,
          time: new Date(progress.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: '📚'
        })) || [])
      ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const stats = [
    {
      title: "Total Coins",
      value: userStats?.aidla_coins || 0,
      icon: "💰",
      color: "linear-gradient(135deg, #f59e0b, #d97706)",
      action: () => navigateToTab("wallet"),
    },
    {
      title: "Today Mined",
      value: userStats?.today_mined || 0,
      icon: "⛏️",
      color: "linear-gradient(135deg, #10b981, #059669)",
      action: () => navigateToTab("mining"),
    },
    {
      title: "Total Mined",
      value: userStats?.total_mined || 0,
      icon: "⚡",
      color: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      action: () => navigateToTab("mining"),
    },
    {
      title: "Friends Invited",
      value: userStats?.total_referred_by_me || 0,
      icon: "👥",
      color: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      action: () => navigateToTab("refer"),
    },
    {
      title: "Referral Earnings",
      value: userStats?.total_earned_from_referrals || 0,
      icon: "💸",
      color: "linear-gradient(135deg, #ec4899, #db2777)",
      action: () => navigateToTab("refer"),
    },
    {
      title: "Mining Speed",
      value: `${userStats?.mining_speed_per_12h || 0}/12h`,
      icon: "🚀",
      color: "linear-gradient(135deg, #f97316, #ea580c)",
      action: () => navigateToTab("mining"),
    },
  ];

  const quickActions = [
    { label: "Start Mining", icon: "⛏️", tab: "mining" },
    { label: "Invite Friends", icon: "👥", tab: "refer" },
    { label: "Learn & Earn", icon: "📚", tab: "learning" },
    { label: "Shop", icon: "🛒", tab: "shop" },
    { label: "AIDLA Bot", icon: "🤖", tab: "aidlabot" },
    { label: "Courses", icon: "🎓", tab: "courses" },
  ];

  const styles = {
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 16,
      marginBottom: 24,
    },
    statCard: {
      background: "#fff",
      borderRadius: 16,
      padding: 20,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e5e7eb",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
    },
    statHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    statIcon: {
      fontSize: 24,
    },
    statTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: "#6b7280",
      margin: 0,
    },
    statValue: {
      fontSize: 28,
      fontWeight: 800,
      margin: "8px 0 0 0",
      color: "#111827",
    },
    quickActions: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: 12,
      marginBottom: 24,
    },
    actionCard: {
      background: "#fff",
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      border: "1px solid #e5e7eb",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
    },
    actionIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    actionLabel: {
      fontSize: 14,
      fontWeight: 600,
      color: "#374151",
      margin: 0,
      textAlign: "center",
    },
    welcomeCard: {
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      color: "#fff",
      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 800,
      margin: "0 0 8px 0",
    },
    welcomeText: {
      fontSize: 15,
      opacity: 0.9,
      margin: 0,
      lineHeight: 1.5,
    },
    recentActivity: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e5e7eb",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: "#111827",
      margin: "0 0 16px 0",
    },
    activityItem: {
      display: "flex",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px solid #f3f4f6",
    },
    activityIcon: {
      fontSize: 20,
      marginRight: 12,
      width: 24,
      textAlign: "center",
    },
    activityText: {
      fontSize: 14,
      color: "#374151",
      margin: 0,
      flex: 1,
    },
    activityTime: {
      fontSize: 12,
      color: "#9ca3af",
      marginLeft: 12,
    },
    noActivities: {
      textAlign: "center",
      padding: 20,
      color: "#6b7280",
      fontSize: 14,
    },
  };

  return (
    <div>
      {/* Welcome Card */}
      <div style={styles.welcomeCard}>
        <h2 style={styles.welcomeTitle}>Welcome Back! 🎉</h2>
        <p style={styles.welcomeText}>
          Track your earnings, invite friends, and continue learning to earn more coins. 
          Your journey to financial freedom starts here!
        </p>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              ...styles.statCard,
              background: stat.color,
              color: "#fff",
            }}
            onClick={stat.action}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
            }}
          >
            <div style={styles.statHeader}>
              <h3 style={{ ...styles.statTitle, color: "rgba(255,255,255,0.9)" }}>{stat.title}</h3>
              <span style={styles.statIcon}>{stat.icon}</span>
            </div>
            <p style={{ ...styles.statValue, color: "#fff" }}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 style={styles.sectionTitle}>Quick Actions</h3>
      <div style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <div
            key={index}
            style={styles.actionCard}
            onClick={() => navigateToTab(action.tab)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
            }}
          >
            <span style={styles.actionIcon}>{action.icon}</span>
            <p style={styles.actionLabel}>{action.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={styles.recentActivity}>
        <h3 style={styles.sectionTitle}>Recent Activity</h3>
        {loadingActivities ? (
          <div style={styles.noActivities}>Loading activities...</div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} style={styles.activityItem}>
              <span style={styles.activityIcon}>{activity.icon}</span>
              <p style={styles.activityText}>{activity.text}</p>
              <span style={styles.activityTime}>{activity.time}</span>
            </div>
          ))
        ) : (
          <div style={styles.noActivities}>
            No recent activities. Start mining, learning, or inviting friends to see activities here!
          </div>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("User");
  const [userStats, setUserStats] = useState(null);
  const [refCode, setRefCode] = useState("");

  const [now, setNow] = useState(new Date());

  // ✅ Responsive state
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isNarrow = w < 992;
  const isTiny = w < 480;

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h >= 5 && h < 12) return "Good morning ☀️";
    if (h >= 12 && h < 17) return "Good afternoon 🌤️";
    if (h >= 17 && h < 21) return "Good evening 🌙";
    return "Good night 🌌";
  }, [now]);

  const formattedDateTime = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: isTiny ? undefined : "2-digit",
    }).format(now);
  }, [now, isTiny]);

  // Auth Check and Load User Data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      setUserEmail(user.email || "");
      
      // Fetch user profile with all stats
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && profile) {
        setFullName(profile.full_name?.trim() || user.email.split("@")[0]);
        setUserStats(profile);
        setRefCode(profile.my_ref_code || "");
      } else {
        setFullName(user.email.split("@")[0]);
        console.error("Error loading profile:", error);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "profile", label: "Profile", icon: "👤" },
    { key: "wallet", label: "Wallet", icon: "💰" },
    { key: "mining", label: "Mining", icon: "⛏️" },
    { key: "refer", label: "Refer", icon: "👥" },
    { key: "learning", label: "Learning", icon: "📚" },
    { key: "courses", label: "Courses", icon: "🎓" },
    { key: "aidlabot", label: "AIDLA Bot", icon: "🤖" },
    { key: "shop", label: "Shop", icon: "🛒" },
  ];

  const activeLabel = tabs.find((t) => t.key === activeTab)?.label || "Dashboard";

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "#f3f4f6",
      padding: "clamp(8px, 2.2vw, 20px)",
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      overflowX: "hidden",
    },

    container: {
      width: "100%",
      maxWidth: 1400,
      display: "grid",
      gap: isTiny ? 12 : 16,
      boxSizing: "border-box",
      minWidth: 0,
    },

    // --- TOP CARD ---
    topCard: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: "clamp(12px, 2vw, 20px)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      display: "flex",
      flexDirection: isTiny ? "column" : "row",
      alignItems: isTiny ? "stretch" : "center",
      justifyContent: "space-between",
      gap: 12,
      minWidth: 0,
      overflow: "hidden",
    },

    hello: {
      margin: 0,
      fontSize: isTiny ? 16 : 18,
      fontWeight: 800,
      color: "#111827",
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    meta: {
      margin: "4px 0 0",
      color: "#6b7280",
      fontWeight: 600,
      fontSize: 12,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    pillRow: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      justifyContent: isTiny ? "space-between" : "flex-end",
      flexWrap: "wrap",
      minWidth: 0,
    },

    pill: {
      padding: "6px 12px",
      borderRadius: 99,
      background: "#f3f4f6",
      color: "#374151",
      fontSize: 12,
      fontWeight: 700,
      border: "1px solid #e5e7eb",
      maxWidth: isTiny ? 170 : 260,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    refCode: {
      padding: "6px 12px",
      borderRadius: 99,
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "#fff",
      fontSize: 12,
      fontWeight: 700,
      border: "none",
      maxWidth: isTiny ? 170 : 260,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      cursor: "pointer",
    },

    logoutBtn: {
      padding: "6px 14px",
      borderRadius: 99,
      background: "#ef4444",
      color: "#fff",
      border: "none",
      fontWeight: 700,
      fontSize: 12,
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "all 0.2s ease",
    },

    // --- LAYOUT ---
    shellDesktop: {
      display: "grid",
      gridTemplateColumns: "260px minmax(0, 1fr)",
      gap: 20,
      alignItems: "start",
      minWidth: 0,
    },

    // --- SIDEBAR (Desktop) ---
    sidebar: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 16,
      position: "sticky",
      top: 20,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      minWidth: 0,
      overflow: "hidden",
    },

    // --- MOBILE MENU (Collapsible) ---
    mobileNavWrapper: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      minWidth: 0,
    },

    mobileNavHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 14px",
      cursor: "pointer",
      background: menuOpen ? "#f9fafb" : "#fff",
      minWidth: 0,
      gap: 10,
    },

    mobileNavTitle: {
      fontWeight: 800,
      fontSize: 15,
      color: "#111827",
      display: "flex",
      alignItems: "center",
      gap: 8,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    hamburgerBtn: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#374151",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 4,
      flex: "0 0 auto",
    },

    mobileNavList: {
      display: menuOpen ? "grid" : "none",
      gridTemplateColumns: isTiny ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
      gap: 8,
      padding: 12,
      borderTop: "1px solid #e5e7eb",
      background: "#f9fafb",
      minWidth: 0,
      boxSizing: "border-box",
    },

    navBtn: (isActive, isMobile = false) => ({
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      textAlign: isMobile ? "center" : "left",
      padding: isMobile ? "10px 8px" : "12px 16px",
      borderRadius: 12,
      border: isActive ? "1px solid #2563eb" : "1px solid transparent",
      background: isActive ? "#eff6ff" : "transparent",
      color: isActive ? "#1d4ed8" : "#4b5563",
      fontWeight: isActive ? 800 : 600,
      fontSize: 14,
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: isMobile ? "center" : "flex-start",
      gap: 10,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),

    // --- CONTENT AREA ---
    content: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: "clamp(12px, 2vw, 24px)",
      minHeight: 500,
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
    },

    loadingCard: {
      padding: 40,
      textAlign: "center",
      color: "#6b7280",
      fontSize: 16,
      fontWeight: 600,
    },
  };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats userStats={userStats} navigateToTab={setActiveTab} />;
      case "profile":
        return <Profile />;
      case "wallet":
        return <Wallet />;
      case "mining":
        return <Mining goToTab={setActiveTab} />;
      case "refer":
        return <ReferFriend />;
      case "learning":
        return <Learning />;
      case "courses":
        return <Courses />;
      case "aidlabot":
        return <AidlaBot />;
      case "shop":
        return <Shop />;
      default:
        return <DashboardStats userStats={userStats} navigateToTab={setActiveTab} />;
    }
  };

  const copyRefCode = () => {
    if (refCode) {
      navigator.clipboard.writeText(refCode);
      alert(`Referral code copied: ${refCode}`);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top Header */}
        <div style={styles.topCard}>
          <div style={{ minWidth: 0 }}>
            <h1 style={styles.hello}>
              {greeting}, {fullName}
            </h1>
            <p style={styles.meta}>{formattedDateTime}</p>
          </div>

          <div style={styles.pillRow}>
            {!isTiny && (
              <>
                <div style={styles.pill}>Coins: {userStats?.aidla_coins?.toLocaleString() || 0}</div>
                {refCode && (
                  <div 
                    style={styles.refCode} 
                    onClick={copyRefCode}
                    title="Click to copy referral code"
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    Ref: {refCode}
                  </div>
                )}
              </>
            )}
            <button 
              style={styles.logoutBtn} 
              onClick={handleLogout} 
              type="button"
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Logout
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        {isNarrow ? (
          <>
            <div style={styles.mobileNavWrapper}>
              <div style={styles.mobileNavHeader} onClick={() => setMenuOpen((v) => !v)}>
                <div style={styles.mobileNavTitle}>
                  <span style={{ color: "#2563eb" }}>●</span> {activeLabel}
                </div>
                <button style={styles.hamburgerBtn} type="button" aria-label="Toggle menu">
                  {menuOpen ? <IconClose /> : <IconMenu />}
                </button>
              </div>

              <div style={styles.mobileNavList}>
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    style={styles.navBtn(activeTab === t.key, true)}
                    onClick={() => {
                      setActiveTab(t.key);
                      setMenuOpen(false);
                    }}
                    type="button"
                    title={t.label}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <main style={styles.content}>{renderTab()}</main>
          </>
        ) : (
          /* DESKTOP */
          <div style={styles.shellDesktop}>
            <aside style={styles.sidebar}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  style={styles.navBtn(activeTab === t.key)}
                  onClick={() => setActiveTab(t.key)}
                  type="button"
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </aside>

            <main style={styles.content}>{renderTab()}</main>
          </div>
        )}
      </div>
    </div>
  );
}