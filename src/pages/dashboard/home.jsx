import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Home({ goToTab }) {
  const [userStats, setUserStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalEarnings: 0,
    referrals: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile for coins
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("aidla_coins")
        .eq("user_id", user.id)
        .single();

      // Simulate stats (replace with real data from your database)
      setUserStats({
        totalCourses: 12,
        completedCourses: 5,
        totalEarnings: profile?.aidla_coins || 0,
        referrals: 8,
      });

      // Simulate recent activity
      setRecentActivity([
        { icon: "🎓", action: "Completed", item: "Introduction to AI", time: "2 hours ago", coins: "+50" },
        { icon: "💰", action: "Earned", item: "Daily Mining Reward", time: "5 hours ago", coins: "+25" },
        { icon: "👥", action: "Referred", item: "New friend joined", time: "1 day ago", coins: "+100" },
        { icon: "🛒", action: "Purchased", item: "Premium Course Access", time: "2 days ago", coins: "-200" },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Error loading stats:", error);
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      key: "mining",
      title: "Start Mining",
      description: "Mine AIDLA coins daily",
      icon: "⛏️",
      gradient: "linear-gradient(135deg, #F4A460 0%, #DAA520 100%)",
      action: () => goToTab("mining"),
    },
    {
      key: "learning",
      title: "Learning Hub",
      description: "Browse courses & lessons",
      icon: "📚",
      gradient: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
      action: () => goToTab("learning"),
    },
    {
      key: "refer",
      title: "Refer & Earn",
      description: "Invite friends, get rewards",
      icon: "👥",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      action: () => goToTab("refer"),
    },
    {
      key: "wallet",
      title: "My Wallet",
      description: "Manage your coins",
      icon: "💰",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      action: () => goToTab("wallet"),
    },
    {
      key: "courses",
      title: "My Courses",
      description: "Continue learning",
      icon: "🎓",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      action: () => goToTab("courses"),
    },
    {
      key: "shop",
      title: "Shop",
      description: "Spend your coins",
      icon: "🛒",
      gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      action: () => goToTab("shop"),
    },
  ];

  const styles = {
    container: {
      width: "100%",
      minHeight: "600px",
    },
    welcomeCard: {
      background: "linear-gradient(135deg, #DAA520 0%, #4A90E2 100%)",
      borderRadius: "20px",
      padding: "40px",
      marginBottom: "30px",
      boxShadow: "0 10px 40px rgba(218, 165, 32, 0.3)",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
    },
    welcomePattern: {
      position: "absolute",
      top: 0,
      right: 0,
      fontSize: "150px",
      opacity: 0.1,
      transform: "rotate(-15deg)",
    },
    welcomeContent: {
      position: "relative",
      zIndex: 1,
    },
    welcomeTitle: {
      fontSize: "32px",
      fontWeight: "900",
      margin: "0 0 10px 0",
      textShadow: "0 2px 10px rgba(0,0,0,0.2)",
    },
    welcomeSubtitle: {
      fontSize: "18px",
      fontWeight: "600",
      margin: 0,
      opacity: 0.95,
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    statCard: {
      background: "#fff",
      borderRadius: "16px",
      padding: "24px",
      border: "2px solid rgba(218, 165, 32, 0.2)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      transition: "all 0.3s ease",
    },
    statIcon: {
      fontSize: "32px",
      marginBottom: "12px",
    },
    statValue: {
      fontSize: "28px",
      fontWeight: "900",
      color: "#111827",
      margin: "0 0 5px 0",
    },
    statLabel: {
      fontSize: "14px",
      color: "#6b7280",
      fontWeight: "600",
      margin: 0,
    },
    sectionTitle: {
      fontSize: "22px",
      fontWeight: "900",
      color: "#111827",
      margin: "0 0 20px 0",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    quickLinksGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    quickLinkCard: {
      borderRadius: "16px",
      padding: "24px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "2px solid rgba(218, 165, 32, 0.2)",
      position: "relative",
      overflow: "hidden",
    },
    quickLinkIcon: {
      fontSize: "40px",
      marginBottom: "12px",
    },
    quickLinkTitle: {
      fontSize: "18px",
      fontWeight: "900",
      color: "#fff",
      margin: "0 0 8px 0",
    },
    quickLinkDesc: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.9)",
      margin: 0,
      fontWeight: "600",
    },
    activitySection: {
      background: "#fff",
      borderRadius: "16px",
      padding: "24px",
      border: "2px solid rgba(218, 165, 32, 0.2)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    },
    activityItem: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      padding: "15px",
      borderRadius: "12px",
      marginBottom: "12px",
      background: "rgba(244, 164, 96, 0.05)",
      border: "1px solid rgba(218, 165, 32, 0.1)",
      transition: "all 0.2s ease",
    },
    activityIcon: {
      fontSize: "28px",
      width: "50px",
      height: "50px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #DAA520 0%, #F4A460 100%)",
      boxShadow: "0 4px 12px rgba(218, 165, 32, 0.3)",
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: "15px",
      fontWeight: "900",
      color: "#111827",
      margin: "0 0 4px 0",
    },
    activityTime: {
      fontSize: "13px",
      color: "#6b7280",
      margin: 0,
      fontWeight: "600",
    },
    activityCoins: {
      fontSize: "16px",
      fontWeight: "900",
      color: "#DAA520",
      padding: "6px 12px",
      borderRadius: "8px",
      background: "rgba(218, 165, 32, 0.1)",
    },
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "50px", animation: "spin 1.5s linear infinite" }}>🎯</div>
        <p style={{ marginTop: "20px", fontSize: "16px", color: "#6b7280", fontWeight: "600" }}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(218, 165, 32, 0.2);
        }
        .quick-link-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        }
        .activity-item:hover {
          background: rgba(244, 164, 96, 0.1);
          transform: translateX(5px);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .welcome-card { padding: 25px !important; }
          .welcome-title { font-size: 24px !important; }
          .welcome-subtitle { font-size: 16px !important; }
          .section-title { font-size: 20px !important; }
          .quick-links-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Welcome Card */}
      <div style={styles.welcomeCard} className="welcome-card">
        <div style={styles.welcomePattern}>🎓</div>
        <div style={styles.welcomeContent}>
          <h2 style={styles.welcomeTitle}>Welcome to AIDLA! 🚀</h2>
          <p style={styles.welcomeSubtitle}>
            Your AI-powered learning journey starts here. Learn, Earn, and Grow!
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid} className="stats-grid">
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIcon}>📚</div>
          <h3 style={styles.statValue}>{userStats.totalCourses}</h3>
          <p style={styles.statLabel}>Total Courses</p>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIcon}>✅</div>
          <h3 style={styles.statValue}>{userStats.completedCourses}</h3>
          <p style={styles.statLabel}>Completed</p>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIcon}>🪙</div>
          <h3 style={styles.statValue}>{userStats.totalEarnings.toLocaleString()}</h3>
          <p style={styles.statLabel}>AIDLA Coins</p>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIcon}>👥</div>
          <h3 style={styles.statValue}>{userStats.referrals}</h3>
          <p style={styles.statLabel}>Referrals</p>
        </div>
      </div>

      {/* Quick Links */}
      <h3 style={styles.sectionTitle}>
        <span>⚡</span> Quick Actions
      </h3>
      <div style={styles.quickLinksGrid} className="quick-links-grid">
        {quickLinks.map((link) => (
          <div
            key={link.key}
            style={{ ...styles.quickLinkCard, background: link.gradient }}
            onClick={link.action}
            className="quick-link-card"
          >
            <div style={styles.quickLinkIcon}>{link.icon}</div>
            <h4 style={styles.quickLinkTitle}>{link.title}</h4>
            <p style={styles.quickLinkDesc}>{link.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <h3 style={styles.sectionTitle}>
        <span>📊</span> Recent Activity
      </h3>
      <div style={styles.activitySection}>
        {recentActivity.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "14px", fontWeight: "600" }}>
            No recent activity yet. Start learning to see your progress!
          </p>
        ) : (
          recentActivity.map((activity, index) => (
            <div key={index} style={styles.activityItem} className="activity-item">
              <div style={styles.activityIcon}>{activity.icon}</div>
              <div style={styles.activityContent}>
                <p style={styles.activityTitle}>
                  {activity.action} • {activity.item}
                </p>
                <p style={styles.activityTime}>{activity.time}</p>
              </div>
              <div style={styles.activityCoins}>{activity.coins}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}