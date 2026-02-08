import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_EMAIL = "zkafridi317@gmail.com";

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function AdminInquiries() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const isMobile = useMemo(() => (typeof window !== "undefined" ? window.innerWidth < 800 : false), []);

  const requireAdmin = async () => {
    const { data } = await supabase.auth.getSession();
    const email = data?.session?.user?.email || "";
    if (!email) {
      navigate("/login");
      return false;
    }
    if (email !== ADMIN_EMAIL) {
      navigate("/");
      return false;
    }
    return true;
  };

  const fetchInquiries = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const ok = await requireAdmin();
      if (!ok) return;

      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("id,name,email,message,page_url,user_agent,created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load inquiries. Check RLS policy + admin login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    setDeletingId(id);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("contact_inquiries").delete().eq("id", id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
      setErrorMsg("Delete failed. Check admin RLS policy.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: 18, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Admin — Contact Inquiries</h2>
          <div style={{ color: "#64748b", fontWeight: 700, marginTop: 4 }}>
            Total: {rows.length}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={fetchInquiries}
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 900, cursor: "pointer" }}
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 900, cursor: "pointer" }}
          >
            Back to Site
          </button>
        </div>
      </div>

      {errorMsg ? (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", fontWeight: 900, color: "#7f1d1d", marginBottom: 12 }}>
          {errorMsg}
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 18, borderRadius: 14, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 900 }}>
          Loading...
        </div>
      ) : rows.length === 0 ? (
        <div style={{ padding: 18, borderRadius: 14, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 900 }}>
          No inquiries yet.
        </div>
      ) : isMobile ? (
        // MOBILE: cards
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 950 }}>{r.name}</div>
                <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>{formatDate(r.created_at)}</div>
              </div>
              <div style={{ marginTop: 6, fontWeight: 800, color: "#334155" }}>{r.email}</div>
              <div style={{ marginTop: 10, color: "#0f172a", fontWeight: 750, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {r.message}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                <button
                  onClick={() => onDelete(r.id)}
                  disabled={deletingId === r.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(239,68,68,0.35)",
                    background: deletingId === r.id ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.08)",
                    fontWeight: 950,
                    color: "#7f1d1d",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  {deletingId === r.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // DESKTOP: table
        <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: 12, fontWeight: 950, borderBottom: "1px solid #e2e8f0" }}>Date</th>
                <th style={{ padding: 12, fontWeight: 950, borderBottom: "1px solid #e2e8f0" }}>Name</th>
                <th style={{ padding: 12, fontWeight: 950, borderBottom: "1px solid #e2e8f0" }}>Email</th>
                <th style={{ padding: 12, fontWeight: 950, borderBottom: "1px solid #e2e8f0" }}>Message</th>
                <th style={{ padding: 12, fontWeight: 950, borderBottom: "1px solid #e2e8f0" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", color: "#64748b", fontWeight: 800 }}>
                    {formatDate(r.created_at)}
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", fontWeight: 950 }}>{r.name}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", fontWeight: 850, color: "#334155" }}>{r.email}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", fontWeight: 750, color: "#0f172a" }}>
                    <div style={{ maxWidth: 520, whiteSpace: "pre-wrap" }}>{r.message}</div>
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    <button
                      onClick={() => onDelete(r.id)}
                      disabled={deletingId === r.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(239,68,68,0.35)",
                        background: deletingId === r.id ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.08)",
                        fontWeight: 950,
                        color: "#7f1d1d",
                        cursor: "pointer",
                      }}
                    >
                      {deletingId === r.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
