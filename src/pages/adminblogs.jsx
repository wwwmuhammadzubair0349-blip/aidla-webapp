import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const ADMIN_EMAILS = ["zkafridi317@gmail.com"]; // add more if needed

const slugify = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

const nowIso = () => new Date().toISOString();

export default function AdminBlogs() {
  const nav = useNavigate();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState(""); // comma separated
  const [status, setStatus] = useState("draft");

  // auth + admin check
  useEffect(() => {
    (async () => {
      setChecking(true);
      try {
        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email || "";
        const okAdmin = !!email && ADMIN_EMAILS.includes(email);
        setAllowed(okAdmin);

        if (!okAdmin) {
          nav("/dashboard", { replace: true });
          return;
        }
      } finally {
        setChecking(false);
      }
    })();
  }, [nav]);

  const resetForm = () => {
    setMode("create");
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverUrl("");
    setTags("");
    setStatus("draft");
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,title,slug,status,tags,updated_at,created_at,published_at")
        .order("updated_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checking && allowed) load();
  }, [checking, allowed]);

  const parsedTags = useMemo(() => {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);
  }, [tags]);

  const startEdit = (p) => {
    setMode("edit");
    setEditingId(p.id);
    setTitle(p.title || "");
    setSlug(p.slug || "");
    setExcerpt(p.excerpt || "");
    setContent(p.content || "");
    setCoverUrl(p.cover_url || "");
    setTags((p.tags || []).join(", "));
    setStatus(p.status || "draft");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadOneForEdit = async (id) => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,content,cover_url,status,tags")
      .eq("id", id)
      .single();
    if (error) throw error;
    startEdit(data);
  };

  const save = async () => {
    setErr("");
    setOk("");

    const t = title.trim();
    if (!t) return setErr("Title is required.");
    const s = (slug || slugify(t)).trim();
    if (!s) return setErr("Slug is required.");

    const payload = {
      title: t,
      slug: s,
      excerpt: excerpt.trim() || null,
      content: content.trim() || "",
      cover_url: coverUrl.trim() || null,
      status,
      tags: parsedTags,
      published_at: status === "published" ? nowIso() : null,
      updated_at: nowIso(),
    };

    if (!payload.content) return setErr("Content is required.");

    try {
      if (mode === "create") {
        const { data: authData } = await supabase.auth.getUser();
        const authorId = authData?.user?.id || null;

        const { error } = await supabase.from("blog_posts").insert([
          {
            ...payload,
            author_id: authorId,
            created_at: nowIso(),
          },
        ]);
        if (error) throw error;

        setOk("Post created.");
        resetForm();
        await load();
      } else {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editingId);
        if (error) throw error;

        setOk("Post updated.");
        resetForm();
        await load();
      }
    } catch (e) {
      setErr(e?.message || "Save failed.");
    }
  };

  const del = async (id) => {
    setErr("");
    setOk("");
    if (!window.confirm("Delete this post?")) return;
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      setOk("Deleted.");
      await load();
    } catch (e) {
      setErr(e?.message || "Delete failed.");
    }
  };

  const togglePublish = async (id, nextStatus) => {
    setErr("");
    setOk("");
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          status: nextStatus,
          published_at: nextStatus === "published" ? nowIso() : null,
        })
        .eq("id", id);
      if (error) throw error;
      setOk(nextStatus === "published" ? "Published." : "Unpublished.");
      await load();
    } catch (e) {
      setErr(e?.message || "Update failed.");
    }
  };

  const styles = {
    page: { minHeight: "100vh", background: "#f3f4f6", padding: 16, display: "flex", justifyContent: "center" },
    wrap: { width: "100%", maxWidth: 1100, display: "grid", gap: 12 },

    top: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, boxShadow: "0 10px 24px rgba(0,0,0,0.05)" },
    title: { margin: 0, fontSize: 22, fontWeight: 950, color: "#0f172a" },
    sub: { margin: "6px 0 0", color: "#475569", fontWeight: 700, lineHeight: 1.6, fontSize: 13 },
    row: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
    btn: (primary) => ({
      padding: "10px 12px",
      borderRadius: 14,
      border: primary ? "none" : "1px solid #e5e7eb",
      background: primary ? "#0f172a" : "#fff",
      color: primary ? "#fff" : "#0f172a",
      fontWeight: 950,
      fontSize: 13,
      cursor: "pointer",
    }),

    form: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, boxShadow: "0 10px 24px rgba(0,0,0,0.05)" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: 12, fontWeight: 950, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" },
    input: { width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 14, border: "1px solid #e2e8f0", outline: "none", fontWeight: 800, color: "#0f172a", background: "#fff" },
    textarea: { width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 14, border: "1px solid #e2e8f0", outline: "none", fontWeight: 700, color: "#0f172a", background: "#fff", minHeight: 180, resize: "vertical" },
    pillRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 },
    pill: { fontSize: 11, fontWeight: 950, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", padding: "4px 8px", borderRadius: 999 },

    list: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, boxShadow: "0 10px 24px rgba(0,0,0,0.05)" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", fontSize: 12, color: "#64748b", fontWeight: 950, padding: "10px 8px", borderBottom: "1px solid #eef2f7" },
    td: { fontSize: 13, color: "#0f172a", fontWeight: 800, padding: "10px 8px", borderBottom: "1px solid #eef2f7", verticalAlign: "top" },
    badge: (st) => ({
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 950,
      border: "1px solid",
      color: st === "published" ? "#166534" : "#92400e",
      background: st === "published" ? "#f0fdf4" : "#fff7ed",
      borderColor: st === "published" ? "#bbf7d0" : "#fed7aa",
    }),
    actRow: { display: "flex", gap: 8, flexWrap: "wrap" },

    alert: (type) => ({
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
      color: type === "error" ? "#991b1b" : "#166534",
      borderRadius: 16,
      padding: 12,
      fontWeight: 900,
      fontSize: 13,
    }),
  };

  if (checking) {
    return (
      <div style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.alert("success")}>Checking permissions…</div>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.top}>
          <h1 style={styles.title}>Admin Blogs</h1>
          <p style={styles.sub}>Create, edit, publish, and delete posts. Public users only see Published posts.</p>
          <div style={styles.row}>
            <button style={styles.btn(false)} onClick={() => nav("/blogs")} type="button">Open Public Blogs</button>
            <button style={styles.btn(false)} onClick={() => nav("/dashboard")} type="button">Back to Dashboard</button>
            <button style={styles.btn(false)} onClick={() => { resetForm(); }} type="button">New Post</button>
          </div>
        </div>

        {err && <div style={styles.alert("error")}>{err}</div>}
        {ok && <div style={styles.alert("success")}>{ok}</div>}

        {/* FORM */}
        <div style={styles.form}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>
              {mode === "create" ? "Create New Post" : "Edit Post"}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                style={styles.btn(false)}
                type="button"
                onClick={() => {
                  const next = slugify(title);
                  setSlug(next);
                }}
              >
                Auto Slug
              </button>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ ...styles.input, padding: "10px 12px", borderRadius: 14, fontWeight: 950 }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <button style={styles.btn(true)} onClick={save} type="button">
                {mode === "create" ? "Create" : "Update"}
              </button>
              {mode === "edit" && (
                <button style={styles.btn(false)} onClick={resetForm} type="button">
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.field}>
              <div style={styles.label}>Title</div>
              <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How to earn coins faster" />
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Slug</div>
              <input style={styles.input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. how-to-earn-coins-faster" />
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Cover Image URL</div>
              <input style={styles.input} value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Tags (comma separated)</div>
              <input style={styles.input} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="aidla, updates, learning" />
              <div style={styles.pillRow}>
                {parsedTags.map((t) => (
                  <span key={t} style={styles.pill}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={styles.field}>
              <div style={styles.label}>Excerpt (short)</div>
              <input style={styles.input} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary used on the blog list…" />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={styles.field}>
              <div style={styles.label}>Content</div>
              <textarea style={styles.textarea} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your blog content here…" />
            </div>
          </div>
        </div>

        {/* LIST */}
        <div style={styles.list}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>All Posts</div>
            <button style={styles.btn(false)} onClick={load} type="button">
              Refresh
            </button>
          </div>

          {loading ? (
            <div style={styles.alert("success")}>Loading posts…</div>
          ) : rows.length === 0 ? (
            <div style={styles.alert("success")}>No posts yet.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Slug</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Updated</th>
                    <th style={styles.th} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}>{r.title}</td>
                      <td style={styles.td} title={r.slug}>&#47;blogs&#47;{r.slug}</td>
                      <td style={styles.td}><span style={styles.badge(r.status)}>{r.status}</span></td>
                      <td style={styles.td}>{new Date(r.updated_at || r.created_at).toLocaleString()}</td>
                      <td style={styles.td}>
                        <div style={styles.actRow}>
                          <button
                            style={styles.btn(false)}
                            type="button"
                            onClick={async () => {
                              try {
                                await loadOneForEdit(r.id);
                              } catch (e) {
                                setErr(e?.message || "Failed to open.");
                              }
                            }}
                          >
                            Edit
                          </button>

                          {r.status === "published" ? (
                            <button style={styles.btn(false)} type="button" onClick={() => togglePublish(r.id, "draft")}>
                              Unpublish
                            </button>
                          ) : (
                            <button style={styles.btn(false)} type="button" onClick={() => togglePublish(r.id, "published")}>
                              Publish
                            </button>
                          )}

                          <button style={{ ...styles.btn(false), borderColor: "#fecaca", color: "#991b1b" }} type="button" onClick={() => del(r.id)}>
                            Delete
                          </button>

                          <button
                            style={styles.btn(false)}
                            type="button"
                            onClick={() => nav(`/blogs/${r.slug}`)}
                            title="Open public post (only works if published)"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
