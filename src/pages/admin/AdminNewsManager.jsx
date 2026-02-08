import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminNewsManager() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const [editing, setEditing] = useState(null); // row or null
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_url: "",
    tags: "",
    source_name: "",
    source_url: "",
    status: "draft",
  });

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_url: "",
      tags: "",
      source_name: "",
      source_url: "",
      status: "draft",
    });
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase
        .from("news_posts")
        .select("id,title,slug,excerpt,status,tags,created_at,published_at,updated_at")
        .order("updated_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load news.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onStartEdit = async (id) => {
    try {
      const { data, error } = await supabase.from("news_posts").select("*").eq("id", id).single();
      if (error) throw error;
      setEditing(data);
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        cover_url: data.cover_url || "",
        tags: (data.tags || []).join(", "),
        source_name: data.source_name || "",
        source_url: data.source_url || "",
        status: data.status || "draft",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      window.alert("Failed to open editor:\n\n" + (e?.message || "Unknown error"));
    }
  };

  const onSave = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    if (title.length < 3) return window.alert("Title is required (min 3 chars).");

    const slug = (form.slug.trim() || slugify(title));
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      cover_url: form.cover_url.trim() || null,
      tags,
      source_name: form.source_name.trim() || null,
      source_url: form.source_url.trim() || null,
      status: form.status,
      published_at: form.status === "published" ? new Date().toISOString() : null,
    };

    try {
      if (editing?.id) {
        const { error } = await supabase.from("news_posts").update(payload).eq("id", editing.id);
        if (error) throw error;
        window.alert("✅ Updated");
      } else {
        const { error } = await supabase.from("news_posts").insert([payload]);
        if (error) throw error;
        window.alert("✅ Created");
      }

      resetForm();
      load();
    } catch (e2) {
      window.alert("❌ Save failed:\n\n" + (e2?.message || "Unknown error") + "\n\nCheck: unique slug, table name, RLS/policies.");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this news item?")) return;
    try {
      const { error } = await supabase.from("news_posts").delete().eq("id", id);
      if (error) throw error;
      window.alert("🗑️ Deleted");
      load();
    } catch (e) {
      window.alert("Delete failed:\n\n" + (e?.message || "Unknown error"));
    }
  };

  const pill = (status) => ({
    display: "inline-flex",
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    border: "1px solid",
    borderColor: status === "published" ? "#bbf7d0" : "#fde68a",
    background: status === "published" ? "#f0fdf4" : "#fffbeb",
    color: status === "published" ? "#166534" : "#92400e",
  });

  const styles = {
    wrap: { maxWidth: 1100, margin: "0 auto", padding: 16 },
    card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 14, boxShadow: "0 10px 22px rgba(0,0,0,0.04)" },
    title: { margin: 0, fontWeight: 950, letterSpacing: "-0.03em" },
    sub: { margin: "6px 0 0", color: "#64748b", fontWeight: 800 },
    grid: { display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 12 },
    row: { display: "grid", gridTemplateColumns: "1.3fr 0.6fr 0.8fr 0.8fr", gap: 10, alignItems: "center", padding: 12, border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff" },
    btn: { border: "1px solid #e5e7eb", background: "#fff", borderRadius: 14, padding: "9px 10px", fontWeight: 900, cursor: "pointer" },
    btnPrimary: { border: 0, background: "#0f172a", color: "#fff", borderRadius: 14, padding: "10px 12px", fontWeight: 950, cursor: "pointer" },
    input: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 14, padding: "10px 12px", fontWeight: 850, outline: "none" },
    textarea: { width: "100%", minHeight: 120, border: "1px solid #e5e7eb", borderRadius: 14, padding: "10px 12px", fontWeight: 850, outline: "none", resize: "vertical" },
    label: { fontWeight: 950, margin: "10px 0 6px" },
    actions: { display: "flex", gap: 8, flexWrap: "wrap" },
    note: { fontSize: 12, color: "#64748b", fontWeight: 800 },
  };

  const compactRows = useMemo(() => rows, [rows]);

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>Admin • News Manager</h1>
        <p style={styles.sub}>Create, edit, publish, and delete news items.</p>

        <form onSubmit={onSave} style={{ marginTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={styles.label}>Title</div>
              <input
                style={styles.input}
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value, slug: p.slug || slugify(e.target.value) }))}
                placeholder="News title"
              />
            </div>

            <div>
              <div style={styles.label}>Slug (unique)</div>
              <input
                style={styles.input}
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="news-title-slug"
              />
            </div>
          </div>

          <div style={styles.label}>Excerpt</div>
          <input style={styles.input} value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} placeholder="Short summary shown on cards" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={styles.label}>Cover URL</div>
              <input style={styles.input} value={form.cover_url} onChange={(e) => setForm((p) => ({ ...p, cover_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div>
              <div style={styles.label}>Tags (comma separated)</div>
              <input style={styles.input} value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="updates, product, roadmap" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={styles.label}>Source Name</div>
              <input style={styles.input} value={form.source_name} onChange={(e) => setForm((p) => ({ ...p, source_name: e.target.value }))} placeholder="AIDLA" />
            </div>
            <div>
              <div style={styles.label}>Source URL</div>
              <input style={styles.input} value={form.source_url} onChange={(e) => setForm((p) => ({ ...p, source_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          <div style={styles.label}>Content</div>
          <textarea style={styles.textarea} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} placeholder="Full news content..." />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 950 }}>Status:</div>
              <select
                style={{ ...styles.input, width: 180 }}
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>

              <div style={styles.note}>When status = published, published_at is set automatically.</div>
            </div>

            <div style={styles.actions}>
              <button type="submit" style={styles.btnPrimary}>{editing ? "Update" : "Create"}</button>
              <button type="button" style={styles.btn} onClick={resetForm}>Clear</button>
              <button type="button" style={styles.btn} onClick={load}>Refresh</button>
            </div>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 12, ...styles.card }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontWeight: 950 }}>All News</h2>
          <div style={styles.note}>{loading ? "Loading…" : `${rows.length} item(s)`}</div>
        </div>

        {err ? (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 14, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 900 }}>
            {err}
          </div>
        ) : null}

        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          {loading ? (
            <div style={{ padding: 12, borderRadius: 14, background: "#f1f5f9", border: "1px solid #e2e8f0", fontWeight: 900 }}>
              Loading…
            </div>
          ) : compactRows.length === 0 ? (
            <div style={{ padding: 12, borderRadius: 14, background: "#f1f5f9", border: "1px solid #e2e8f0", fontWeight: 900 }}>
              No news items yet.
            </div>
          ) : (
            compactRows.map((r) => (
              <div key={r.id} style={styles.row}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 950, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                  <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    /news/{r.slug}
                  </div>
                </div>

                <div><span style={pill(r.status)}>{r.status}</span></div>

                <div style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>
                  {r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button style={styles.btn} onClick={() => onStartEdit(r.id)} type="button">Edit</button>
                  <button style={{ ...styles.btn, borderColor: "#fecaca", color: "#991b1b" }} onClick={() => onDelete(r.id)} type="button">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
