import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.jpg";

/* ---------------- ICONS ---------------- */
const Icons = {
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  Tag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41L11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z" />
      <path d="M7 7h.01" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  ChevronUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  ),
  Spark: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l1.3 5.1L18 8.4l-4.7 1.3L12 15l-1.3-5.3L6 8.4l4.7-1.3L12 2z" />
      <path d="M5 13l.7 2.6L8 16.3l-2.3.7L5 19l-.7-2.6L2 15.6l2.3-.7L5 13z" />
      <path d="M19 13l.7 2.6 2.3.7-2.3.7L19 19l-.7-2.6-2.3-.7 2.3-.7L19 13z" />
    </svg>
  ),
};

/* ---------------- HELPERS ---------------- */
const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(new Date(iso));
  } catch {
    return "";
  }
};

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
function setOG(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function News() {
  const nav = useNavigate();
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isMobile = w < 768;

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");

  /* responsive */
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* scroll */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* SEO */
  useEffect(() => {
    const title = "AIDLA News | Updates & Announcements";
    const desc = "Latest AIDLA updates, announcements, partnerships, and platform news.";
    document.title = title;
    setMeta("description", desc);
    setOG("og:title", title);
    setOG("og:description", desc);
    setOG("og:type", "website");
    return () => {
      document.title = "AIDLA";
    };
  }, []);

  /* animations */
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
      * { box-sizing: border-box; min-width: 0; }
      html, body { width: 100%; overflow-x: hidden; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
      img, svg, video, canvas { max-width: 100%; height: auto; }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
      @keyframes pulse { 0%{opacity:.65} 50%{opacity:1} 100%{opacity:.65} }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  /* load */
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase
        .from("news_posts")
        .select("id,title,slug,excerpt,cover_url,status,tags,is_featured,created_at,published_at")
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load news.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const allTags = useMemo(() => {
    const s = new Set();
    rows.forEach((r) => (r.tags || []).forEach((t) => s.add(String(t))));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !query ||
        String(r.title || "").toLowerCase().includes(query) ||
        String(r.excerpt || "").toLowerCase().includes(query);
      const matchesTag = !tag || (r.tags || []).includes(tag);
      return matchesQ && matchesTag;
    });
  }, [rows, q, tag]);

  /* ORDER FIX: News not last */
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/blogs", label: "Blogs" },
    { to: "/news", label: "News" }, // ✅ here (not last)
    { to: "/faqs", label: "FAQs" },
    { to: "/contact", label: "Contact" },
  ];

  const styles = {
    shell: { minHeight: "100vh", background: "#f3f4f6", display: "flex", flexDirection: "column" },

    navbar: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: scrolled ? "10px 0" : "14px 0",
      transition: "all .25s ease",
      borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
      background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
    },

    container: {
      width: "100%",
      maxWidth: 1280,
      margin: "0 auto",
      padding: isMobile ? "0 10px" : "0 24px",
    },

    navInner: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
    navLogo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", minWidth: 0 },
    logoText: { fontWeight: 950, fontSize: 20, letterSpacing: "-0.03em", color: "#0f172a", whiteSpace: "nowrap" },

    navDesktop: { display: isMobile ? "none" : "flex", alignItems: "center", gap: 18 },
    navLink: { textDecoration: "none", color: "#64748b", fontWeight: 900, fontSize: 14 },

    navActions: { display: isMobile ? "none" : "flex", gap: 10, alignItems: "center" },
    mobileToggle: { display: isMobile ? "inline-flex" : "none", background: "none", border: 0, cursor: "pointer", padding: 8, color: "#0f172a" },

    btn: {
      border: 0,
      cursor: "pointer",
      fontWeight: 950,
      borderRadius: 999,
      padding: "10px 16px",
      transition: ".18s ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      textDecoration: "none",
      lineHeight: 1,
      maxWidth: "100%",
      whiteSpace: "nowrap",
    },
    btnPrimary: { background: "linear-gradient(135deg,#4f46e5 0%,#4338ca 100%)", color: "#fff", boxShadow: "0 10px 22px rgba(79,70,229,0.30)" },
    btnSecondary: { background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0" },

    drawer: {
      position: "absolute",
      top: "100%",
      left: 0,
      width: "100%",
      background: "#fff",
      borderTop: "1px solid #e2e8f0",
      boxShadow: "0 12px 26px rgba(15,23,42,0.10)",
      transformOrigin: "top",
      transform: isMobileMenuOpen ? "scaleY(1)" : "scaleY(0)",
      opacity: isMobileMenuOpen ? 1 : 0,
      transition: "transform .22s ease, opacity .22s ease",
      overflow: "hidden",
    },
    drawerGrid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, background: "#e2e8f0" },
    drawerItem: { background: "#fff", padding: 16, textAlign: "center", fontWeight: 950, color: "#0f172a", textDecoration: "none" },
    drawerActions: { padding: "14px 10px", display: "flex", flexDirection: "column", gap: 10, paddingBottom: "max(14px, env(safe-area-inset-bottom))" },

    main: { width: "100%", flex: 1, display: "flex", justifyContent: "center", padding: 16, paddingTop: 92, overflowX: "hidden" },
    inner: { width: "100%", maxWidth: 1100, display: "flex", flexDirection: "column", gap: 12, animation: "fadeInUp 0.35s ease-out" },

    hero: {
      position: "relative",
      background: "#fff",
      borderRadius: 20,
      border: "1px solid #e5e7eb",
      boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
      overflow: "hidden",
    },
    heroGlow: {
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(circle at 18% 25%, rgba(79,70,229,0.16), transparent 55%), radial-gradient(circle at 85% 30%, rgba(59,130,246,0.14), transparent 60%)",
      filter: "blur(14px)",
      transform: "scale(1.15)",
      pointerEvents: "none",
    },
    heroTop: {
      position: "relative",
      padding: isMobile ? 16 : 20,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 12px",
      borderRadius: 999,
      fontWeight: 950,
      fontSize: 12,
      color: "#4f46e5",
      background: "#eef2ff",
      border: "1px solid #c7d2fe",
      marginBottom: 10,
      width: "fit-content",
    },
    h1: { margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 980, color: "#0f172a", letterSpacing: "-0.03em" },
    sub: { margin: "8px 0 0", color: "#475569", fontWeight: 750, lineHeight: 1.65, fontSize: 14, maxWidth: 740 },

    controls: {
      position: "relative",
      padding: isMobile ? 14 : 16,
      borderTop: "1px solid #e5e7eb",
      background: "#f8fafc",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr",
      gap: 10,
    },
    inputWrap: { position: "relative" },
    inputIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b" },
    input: { width: "100%", padding: "12px 12px 12px 36px", borderRadius: 14, border: "1px solid #e2e8f0", outline: "none", fontWeight: 850, color: "#0f172a", background: "#fff" },
    select: { width: "100%", padding: "12px 12px 12px 36px", borderRadius: 14, border: "1px solid #e2e8f0", outline: "none", fontWeight: 850, color: "#0f172a", background: "#fff", appearance: "none" },

    featuredStrip: {
      background: "linear-gradient(135deg, rgba(34,197,94,0.16) 0%, rgba(16,185,129,0.10) 100%)",
      border: "1px solid rgba(34,197,94,0.25)",
      borderRadius: 16,
      padding: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    featuredTitle: { margin: 0, fontWeight: 980, letterSpacing: "-0.02em", color: "#052e16", fontSize: 14 },
    featuredText: { margin: 0, fontWeight: 850, color: "#14532d", fontSize: 13, lineHeight: 1.55 },

    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },

    card: {
      background: "#fff",
      borderRadius: 18,
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      boxShadow: "0 10px 22px rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      cursor: "pointer",
      transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
    },
    cover: { width: "100%", height: 160, background: "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(59,130,246,0.10) 100%)", borderBottom: "1px solid #eef2f7", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 900 },
    img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

    body: { padding: 14, display: "flex", flexDirection: "column", gap: 8, flex: 1 },
    pillRow: { display: "flex", gap: 6, flexWrap: "wrap" },
    pill: { fontSize: 11, fontWeight: 950, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "4px 8px", borderRadius: 999 },
    featuredPill: { fontSize: 11, fontWeight: 950, color: "#166534", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "4px 8px", borderRadius: 999 },

    title: { margin: 0, fontSize: 15.5, fontWeight: 980, color: "#0f172a", lineHeight: 1.25 },
    excerpt: { margin: 0, fontSize: 13, fontWeight: 750, color: "#475569", lineHeight: 1.65 },

    meta: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: "auto", paddingTop: 6 },
    date: { fontSize: 12, fontWeight: 900, color: "#64748b" },
    read: { color: "#4f46e5", fontWeight: 980, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 },

    alert: (type) => ({
      background: type === "error" ? "#fef2f2" : "#f1f5f9",
      border: `1px solid ${type === "error" ? "#fecaca" : "#e2e8f0"}`,
      color: type === "error" ? "#991b1b" : "#334155",
      borderRadius: 16,
      padding: 14,
      fontWeight: 900,
      fontSize: 13,
    }),

    footer: { borderTop: "1px solid #e2e8f0", padding: "40px 0 22px", background: "#fff" },
    footerGrid: { display: "grid", gap: 20, gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr" },
    footerTitle: { fontWeight: 950, marginBottom: 10, color: "#0f172a" },
    footerLink: { display: "block", textDecoration: "none", color: "#64748b", fontWeight: 850, marginBottom: 8 },
  };

  const featuredCount = useMemo(() => rows.filter((r) => r.is_featured).length, [rows]);

  return (
    <div style={styles.shell}>
      {/* NAV */}
      <nav style={styles.navbar}>
        <div style={styles.container}>
          <div style={styles.navInner}>
            <div style={styles.navLogo} onClick={() => nav("/")}>
              <img src={logo} alt="AIDLA" style={{ height: 34, width: 34, borderRadius: 10, objectFit: "contain" }} />
              <span style={styles.logoText}>AIDLA</span>
            </div>

            <div style={styles.navDesktop}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    color: isActive ? "#4f46e5" : "#64748b",
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div style={styles.navActions}>
              <button onClick={() => nav("/login")} style={{ ...styles.btn, ...styles.btnSecondary }} type="button">
                Login
              </button>
              <button onClick={() => nav("/signup")} style={{ ...styles.btn, ...styles.btnPrimary }} type="button">
                Signup
              </button>
            </div>

            <button style={styles.mobileToggle} onClick={() => setIsMobileMenuOpen((v) => !v)} type="button" aria-label="Menu">
              {isMobileMenuOpen ? <Icons.ChevronUp /> : <Icons.Menu />}
            </button>
          </div>

          <div style={styles.drawer}>
            <div style={styles.drawerGrid}>
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} style={styles.drawerItem} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div style={styles.drawerActions}>
              <button onClick={() => { nav("/login"); setIsMobileMenuOpen(false); }} style={{ ...styles.btn, ...styles.btnSecondary, width: "100%" }} type="button">
                Login
              </button>
              <button onClick={() => { nav("/signup"); setIsMobileMenuOpen(false); }} style={{ ...styles.btn, ...styles.btnPrimary, width: "100%" }} type="button">
                Create Account
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main style={styles.main}>
        <div style={styles.inner}>
          <section style={styles.hero}>
            <div style={styles.heroGlow} />

            <div style={styles.heroTop}>
              <div>
                <div style={styles.badge}>
                  <Icons.Spark /> AIDLA Updates
                </div>
                <h1 style={styles.h1}>News</h1>
                <p style={styles.sub}>
                  Product updates, announcements, partnerships, and platform changes — from AIDLA.
                </p>
              </div>

              {!isMobile && (
                <button onClick={() => nav("/dashboard")} style={{ ...styles.btn, ...styles.btnPrimary, padding: "10px 14px" }} type="button">
                  Go Dashboard <Icons.ArrowRight />
                </button>
              )}
            </div>

            <div style={styles.controls}>
              <div style={styles.inputWrap}>
                <div style={styles.inputIcon}><Icons.Search /></div>
                <input
                  style={styles.input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search news..."
                  type="text"
                />
              </div>

              <div style={styles.inputWrap}>
                <div style={styles.inputIcon}><Icons.Tag /></div>
                <select style={styles.select} value={tag} onChange={(e) => setTag(e.target.value)}>
                  <option value="">All tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Featured strip (only if exists) */}
          {!loading && !err && featuredCount > 0 && (
            <div style={styles.featuredStrip}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <p style={styles.featuredTitle}>Featured updates</p>
                <p style={styles.featuredText}>
                  {featuredCount} highlighted announcement{featuredCount > 1 ? "s" : ""} available.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTag("")}
                style={{ ...styles.btn, background: "#052e16", color: "#fff", padding: "10px 14px" }}
              >
                View All <Icons.ArrowRight />
              </button>
            </div>
          )}

          {err && <div style={styles.alert("error")}>{err}</div>}

          {loading ? (
            <div style={styles.alert("default")}>
              Loading news… <span style={{ marginLeft: 8, animation: "pulse 1.2s infinite" }}>●</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.alert("default")}>No news found.</div>
          ) : (
            <section style={styles.grid}>
              {filtered.map((p) => (
                <article
                  key={p.id}
                  style={styles.card}
                  role="button"
                  tabIndex={0}
                  onClick={() => nav(`/news/${p.slug}`)}
                  onKeyDown={(e) => e.key === "Enter" && nav(`/news/${p.slug}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 16px 30px rgba(0,0,0,0.08)";
                    e.currentTarget.style.borderColor = "rgba(79,70,229,0.30)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 22px rgba(0,0,0,0.04)";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <div style={styles.cover}>
                    {p.cover_url ? <img src={p.cover_url} alt={p.title} style={styles.img} /> : "AIDLA"}
                  </div>

                  <div style={styles.body}>
                    <div style={styles.pillRow}>
                      {p.is_featured && <span style={styles.featuredPill}>Featured</span>}
                      {(p.tags || []).slice(0, 2).map((t) => (
                        <span key={t} style={styles.pill}>{t}</span>
                      ))}
                    </div>

                    <h3 style={styles.title}>{p.title}</h3>
                    <p style={styles.excerpt}>{p.excerpt || "Read more…"}</p>

                    <div style={styles.meta}>
                      <div style={styles.date}>{fmtDate(p.published_at || p.created_at)}</div>
                      <div style={styles.read}>
                        Read <Icons.ArrowRight />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerGrid}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <img src={logo} alt="AIDLA" style={{ height: 32, width: 32, borderRadius: 10 }} />
                <div style={{ fontWeight: 950, fontSize: 18, letterSpacing: "-0.03em", color: "#0f172a" }}>AIDLA</div>
              </div>
              <div style={{ color: "#64748b", fontWeight: 850, lineHeight: 1.7, maxWidth: 420 }}>
                The AI-first learning ecosystem where knowledge becomes rewards.
              </div>
            </div>

            <div>
              <div style={styles.footerTitle}>Platform</div>
              <Link style={styles.footerLink} to="/courses">Courses</Link>
              <Link style={styles.footerLink} to="/tests">Competitions</Link>
              <Link style={styles.footerLink} to="/rewards">Rewards</Link>
            </div>

            <div>
              <div style={styles.footerTitle}>Company</div>
              <Link style={styles.footerLink} to="/about">About</Link>
              <Link style={styles.footerLink} to="/blogs">Blog</Link>
              <Link style={styles.footerLink} to="/faqs">FAQs</Link>
            </div>
          </div>

          <div style={{ paddingTop: 14, borderTop: "1px solid #e2e8f0", textAlign: "center", color: "#64748b", fontWeight: 900, fontSize: 13 }}>
            © {new Date().getFullYear()} AIDLA Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
