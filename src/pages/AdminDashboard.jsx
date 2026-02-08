import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Admin tab pages (coming soon)
import AdminUsers from "./admin/AdminUsers";
import AdminDepositRequests from "./admin/AdminDepositRequests";
import AdminWithdrawalRequests from "./admin/AdminWithdrawalRequests";
import AdminTestManagement from "./admin/AdminTestManagement";
import AdminMiningManagement from "./admin/AdminMiningManagement";
import AdminShopManagement from "./admin/AdminShopManagement";
import AdminCoursesManagement from "./admin/AdminCoursesManagement";
import AdminCoinsManagement from "./admin/AdminCoinsManagement";
import AdminBlogs from "./adminblogs";
import HomeManager from "./admin/HomeManager";
import AdminInquiries from "./admin/admininquiries";
import AdminNewsManager from "./admin/AdminNewsManager";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const ADMIN_EMAIL = "zkafridi317@gmail.com";

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const styles = {
    top: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 16,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "center",
      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    },
    title: { margin: 0, fontSize: 22, fontWeight: 900 },
    btnRow: { display: "flex", gap: 10, flexWrap: "wrap" },
    btnGhost: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 900,
      cursor: "pointer",
    },
    btnLogout: {
      padding: "10px 12px",
      borderRadius: 12,
      border: 0,
      background: "#111827",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
    },
    shell: {
      marginTop: 14,
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      gap: 14,
      alignItems: "start",
      maxWidth: 1200,
      marginLeft: "auto",
      marginRight: "auto",
    },
    sidebar: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 12,
      position: "sticky",
      top: 80,
    },
    tabBtn: (isActive) => ({
      width: "100%",
      textAlign: "left",
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: isActive ? "#111827" : "#f9fafb",
      color: isActive ? "#fff" : "#111827",
      fontWeight: 900,
      cursor: "pointer",
      marginBottom: 8,
    }),
    content: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 16,
      minHeight: 420,
    },
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const userEmail = (user.email || "").toLowerCase();

      // Block non-admin
      if (userEmail !== ADMIN_EMAIL) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setLoading(false);
    })();
  }, [navigate]);

  const tabs = [
    { key: "users", label: "Users" },
    { key: "deposits", label: "Deposit Requests" },
    { key: "withdrawals", label: "Withdrawal Requests" },
    { key: "tests", label: "Test Management" },
    { key: "mining", label: "Mining Management" },
    { key: "shop", label: "Shop Management" },
    { key: "courses", label: "Courses Management" },
    { key: "coins", label: "Coins Management" },
    { key: "blogs", label: "Blogs Management"},
    { key: "home", label: "Home Management"},
    { key: "Inquiries", label: "Inquiries"},
    { key: "News", label: "News Manager"},

  ];

  const renderTab = () => {
    switch (activeTab) {
      case "users":
        return <AdminUsers />;
      case "deposits":
        return <AdminDepositRequests />;
      case "withdrawals":
        return <AdminWithdrawalRequests />;
      case "tests":
        return <AdminTestManagement />;
      case "mining":
        return <AdminMiningManagement />;
      case "shop":
        return <AdminShopManagement />;
      case "courses":
        return <AdminCoursesManagement />;
      case "coins":
        return <AdminCoinsManagement />;
      case "blogs":
        return <AdminBlogs />;
      case "home":
        return <HomeManager />;
            case "Inquiries":
        return <AdminInquiries />;
            case "News":
        return <AdminNewsManager />;
      default:
        return <AdminUsers />;
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <div style={styles.top}>
          <h1 style={styles.title}>Loading admin dashboard...</h1>
        </div>
      </div>
    );
  }

  const isNarrow = typeof window !== "undefined" && window.innerWidth < 900;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={styles.top}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        <div style={styles.btnRow}>
          <button
            style={styles.btnGhost}
            onClick={() => navigate("/choose-side")}
            type="button"
          >
            Choose Side
          </button>
          <button
            style={styles.btnGhost}
            onClick={() => navigate("/dashboard")}
            type="button"
          >
            User Dashboard
          </button>
          <button
            style={styles.btnLogout}
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          ...styles.shell,
          gridTemplateColumns: isNarrow ? "1fr" : "280px 1fr",
        }}
      >
        <aside style={styles.sidebar}>
          {tabs.map((t) => (
            <button
              key={t.key}
              style={styles.tabBtn(activeTab === t.key)}
              onClick={() => setActiveTab(t.key)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </aside>

        <section style={styles.content}>{renderTab()}</section>
      </div>
    </div>
  );
}
