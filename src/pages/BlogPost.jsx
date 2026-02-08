import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.jpg";

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
};

function isValidUrl(u) {
  try {
    const x = new URL(u);
    return !!x;
  } catch {
    return false;
  }
}

function setMetaTag(attrName, nameOrProp, content) {
  let el = document.querySelector(`meta[${attrName}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function BlogPost() {
  const nav = useNavigate();
  const { slug } = useParams();

  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isMobile = w < 768;
  const isTiny = w < 420;

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [post, setPost] = useState(null);

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
      @keyframes pulse { 0%{opacity:.65} 50%{opacity:1} 100%{opacity:.65} }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("title,excerpt,content,cover_url,tags,created_at,published_at,status,slug")
          .eq("slug", slug)
          .eq("status", "published")
          .single();

        if (error) throw error;
        setPost(data);

        // SEO
        const title = data?.title ? `${data.title} | AIDLA Blog` : "AIDLA Blog";
        const desc = (data?.excerpt || "AIDLA blog posts, guides and announcements.").slice(0, 160);
        document.title = title;
        setMetaTag("name", "description", desc);
        setMetaTag("property", "og:title", title);
        setMetaTag("property", "og:description", desc);
        setMetaTag("property", "og:type", "article");
        if (data?.cover_url && isValidUrl(data.cover_url)) setMetaTag("property", "og:image", data.cover_url);
      } catch (e) {
        setErr(e?.message || "Post not found.");
        document.title = "AIDLA Blog";
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      document.title = "AIDLA";
    };
  }, [slug]);

  const navItems = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
      { to: "/blogs", label: "Blogs" },
      { to: "/news", label: "News" },
      { to: "/faqs", label: "FAQs" },
      { to: "/contact", label: "Contact" },
    ],
    []
  );

  const Icons = useMemo(
    () => ({
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
      ArrowRight: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M13 5l7 7-7 7" />
        </svg>
      ),
    }),
    []
  );

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
    navLogo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textDecoration: "none", minWidth: 0 },
    logoText: { fontWeight: 950, fontSize: 20, letterSpacing: "-0.03em", color: "#0f172a", whiteSpace: "nowrap" },
    navDesktop: { display: isMobile ? "none" : "flex", alignItems: "center", gap: 18 },
    navLink: { textDecoration: "none", color: "#64748b", fontWeight: 900, fontSize: 14 },
    navActions: { display: isMobile ? "none" : "flex", gap: 10, alignItems: "center" },

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
    },
    btnPrimary: { background: "linear-gradient(135deg,#4f46e5 0%,#4338ca 100%)", color: "#fff", boxShadow: "0 10px 22px rgba(79,70,229,0.30)" },
    btnSecondary: { background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0" },

    mobileToggle: { display: isMobile ? "inline-flex" : "none", background: "none", border: 0, cursor: "pointer", padding: 8, color: "#0f172a" },
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

    main: { width: "100%", flex: 1, display: "flex", justifyContent: "center", padding: isTiny ? 12 : 16, paddingTop: 92, overflowX: "hidden" },
    inner: { width: "100%", maxWidth: 980, display: "flex", flexDirection: "column", gap: 12, minWidth: 0, animation: "fadeInUp 0.35s ease-out" },

    topActions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    smallBtn: { border: "1px solid #e5e7eb", background: "#fff", borderRadius: 14, padding: "10px 12px", fontWeight: 950, cursor: "pointer" },

    card: { background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 10px 24px rgba(0,0,0,0.05)" },
    cover: { width: "100%", height: isMobile ? 210 : 320, background: "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(59,130,246,0.10) 100%)" },
    coverImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

    content: { padding: isMobile ? 14 : 18 },
    title: { margin: 0, fontWeight: 980, letterSpacing: "-0.03em", color: "#0f172a", fontSize: isMobile ? 22 : 30, lineHeight: 1.15 },
    meta: { marginTop: 10, color: "#64748b", fontWeight: 850, fontSize: 13, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },

    pills: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 },
    pill: { fontSize: 11, fontWeight: 950, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "5px 10px", borderRadius: 999 },

    excerpt: { marginTop: 12, color: "#334155", lineHeight: 1.75, fontWeight: 800, fontSize: 14, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 14 },
    body: { marginTop: 12, color: "#0f172a", lineHeight: 1.9, fontWeight: 750, whiteSpace: "pre-wrap", fontSize: 15 },

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

  return (
    <div style={styles.shell}>
      {/* anti overflow (important) */}
      <style>{`
        * { box-sizing: border-box; min-width: 0; }
        html, body { width: 100%; overflow-x: hidden; }
        img, svg { max-width: 100%; height: auto; }
      `}</style>

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
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    ...styles.navLink,
                    color: item.to === "/blogs" ? "#4f46e5" : styles.navLink.color,
                  }}
                >
                  {item.label}
                </Link>
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
              <Link to="/rewards" style={styles.drawerItem} onClick={() => setIsMobileMenuOpen(false)}>
                Rewards
              </Link>
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
          <div style={styles.topActions}>
            <button style={styles.smallBtn} onClick={() => nav("/blogs")} type="button">
              ← Back to Blogs
            </button>
            {!isMobile && (
              <button style={styles.smallBtn} onClick={() => nav("/dashboard")} type="button">
                Go Dashboard <Icons.ArrowRight />
              </button>
            )}
          </div>

          {err ? <div style={styles.alert("error")}>{err}</div> : null}

          {loading ? (
            <div style={styles.alert("default")}>
              Loading post… <span style={{ marginLeft: 8, animation: "pulse 1.2s infinite" }}>●</span>
            </div>
          ) : post ? (
            <article style={styles.card}>
              <div style={styles.cover}>
                {post.cover_url ? <img src={post.cover_url} alt={post.title} style={styles.coverImg} /> : null}
              </div>

              <div style={styles.content}>
                <h1 style={styles.title}>{post.title}</h1>

                <div style={styles.meta}>
                  <span>{fmtDate(post.published_at || post.created_at)}</span>
                </div>

                <div style={styles.pills}>
                  {(post.tags || []).slice(0, 8).map((t) => (
                    <span key={t} style={styles.pill}>
                      {t}
                    </span>
                  ))}
                </div>

                {post.excerpt ? <div style={styles.excerpt}>{post.excerpt}</div> : null}

                <div style={styles.body}>{post.content || ""}</div>
              </div>
            </article>
          ) : null}
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
              <Link style={styles.footerLink} to="/news">News</Link>
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
