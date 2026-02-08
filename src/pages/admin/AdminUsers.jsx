import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [countLoading, setCountLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState([]);

  const [expanded, setExpanded] = useState({}); // { [user_id]: true/false }

  // Pagination (optional but good)
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const styles = {
    header: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: { margin: 0, fontSize: 20, fontWeight: 900 },
    pill: {
      display: "inline-block",
      padding: "8px 10px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 900,
      color: "#111827",
    },
    searchRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
      marginBottom: 12,
    },
    input: {
      flex: "1 1 320px",
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      outline: "none",
    },
    btn: {
      padding: "10px 12px",
      borderRadius: 12,
      border: 0,
      background: "#111827",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
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
    list: { display: "grid", gap: 10, marginTop: 10 },
    card: {
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 14,
      background: "#fff",
    },
    rowTop: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    name: { margin: 0, fontWeight: 900, fontSize: 16 },
    meta: { margin: "6px 0 0", color: "#6b7280", fontSize: 13, lineHeight: 1.5 },
    actionRow: { marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" },
    moreBtn: {
      padding: "8px 10px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontWeight: 900,
      cursor: "pointer",
    },
    details: {
      marginTop: 12,
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      padding: 12,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 10,
    },
    field: {
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 10,
      background: "#fff",
    },
    label: { fontSize: 12, color: "#6b7280", fontWeight: 800, marginBottom: 6 },
    value: { margin: 0, fontWeight: 900, color: "#111827" },

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

    pager: { marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  };

  const safe = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

  const fetchCount = async (q) => {
    setCountLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_users_count", {
        search_text: q || null,
      });
      if (error) throw error;
      setTotalUsers(Number(data || 0));
    } catch (e) {
      setErrorMsg(e?.message || "Failed to fetch users count.");
    } finally {
      setCountLoading(false);
    }
  };

  const fetchUsers = async (q, p) => {
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      const offset = (p - 1) * pageSize;

      const { data, error } = await supabase.rpc("admin_users_list", {
        search_text: q || null,
        lim: pageSize,
        off: offset,
      });

      if (error) throw error;
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to fetch users list.");
    } finally {
      setLoading(false);
    }
  };

  // initial
  useEffect(() => {
    fetchCount(null);
    fetchUsers(null, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // on search/page
  useEffect(() => {
    setPage(1);
    fetchCount(debouncedSearch);
    fetchUsers(debouncedSearch, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers(debouncedSearch, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const maxPages = useMemo(() => {
    return Math.max(1, Math.ceil((totalUsers || 0) / pageSize));
  }, [totalUsers]);

  const toggleExpand = (userId) => {
    setExpanded((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const onRefresh = async () => {
    setStatusMsg("Refreshing...");
    await fetchCount(debouncedSearch);
    await fetchUsers(debouncedSearch, page);
    setStatusMsg("Refreshed ✅");
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Users</h2>
        <div style={styles.pill}>
          Total Users: {countLoading ? "Loading..." : totalUsers}
        </div>
      </div>

      <div style={styles.searchRow}>
        <input
          style={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
        />
        <button style={styles.btn} onClick={onRefresh} type="button">
          Refresh
        </button>
        <button
          style={styles.btnGhost}
          onClick={() => {
            setSearch("");
            setExpanded({});
          }}
          type="button"
        >
          Clear
        </button>
      </div>

      {errorMsg ? <div style={styles.msgErr}>{errorMsg}</div> : null}
      {statusMsg ? <div style={styles.msgOk}>{statusMsg}</div> : null}

      <div style={styles.list}>
        {loading ? (
          <div style={styles.card}>
            <p style={{ margin: 0, fontWeight: 900 }}>Loading users...</p>
            <p style={{ marginTop: 8, color: "#6b7280" }}>Please wait</p>
          </div>
        ) : users.length === 0 ? (
          <div style={styles.card}>
            <p style={{ margin: 0, fontWeight: 900 }}>No users found</p>
            <p style={{ marginTop: 8, color: "#6b7280" }}>
              Try a different search keyword.
            </p>
          </div>
        ) : (
          users.map((u) => {
            const isOpen = !!expanded[u.user_id];

            return (
              <div key={u.user_id} style={styles.card}>
                <div style={styles.rowTop}>
                  <div>
                    <p style={styles.name}>{safe(u.full_name)}</p>
                    <p style={styles.meta}>
                      Email: {safe(u.email)} • Coins: {safe(u.aidla_coins)} • Referred:{" "}
                      {safe(u.total_referred_by_me)}
                    </p>
                  </div>

                  <button
                    style={styles.moreBtn}
                    onClick={() => toggleExpand(u.user_id)}
                    type="button"
                  >
                    {isOpen ? "Hide" : "Show more"}
                  </button>
                </div>

                {isOpen ? (
                  <div style={styles.details}>
                    <div style={styles.field}>
                      <div style={styles.label}>Phone</div>
                      <p style={styles.value}>{safe(u.phone_number)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>WhatsApp</div>
                      <p style={styles.value}>{safe(u.whatsapp_number)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Country</div>
                      <p style={styles.value}>{safe(u.country)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>City</div>
                      <p style={styles.value}>{safe(u.city)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Street Address</div>
                      <p style={styles.value}>{safe(u.street_address)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Institute</div>
                      <p style={styles.value}>{safe(u.institute_name)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Education Level</div>
                      <p style={styles.value}>{safe(u.education_level)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Profession</div>
                      <p style={styles.value}>{safe(u.profession_title)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>My Ref Code</div>
                      <p style={styles.value}>{safe(u.my_ref_code)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Used Refer Code</div>
                      <p style={styles.value}>{safe(u.refer_code)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Total Earned From Referrals</div>
                      <p style={styles.value}>{safe(u.total_earned_from_referrals)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Mining Total</div>
                      <p style={styles.value}>{safe(u.total_mined)}</p>
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Joined</div>
                      <p style={styles.value}>
                        {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div style={styles.pager}>
        <button
          style={styles.btnGhost}
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>

        <div style={styles.pill}>
          Page {page} / {maxPages}
        </div>

        <button
          style={styles.btnGhost}
          type="button"
          onClick={() => setPage((p) => Math.min(maxPages, p + 1))}
          disabled={page >= maxPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
