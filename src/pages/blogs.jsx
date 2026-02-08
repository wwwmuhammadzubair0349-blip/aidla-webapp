import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.jpg";

const Icons = {
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
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  Tag: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41L11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z" />
      <path d="M7 7h.01" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
};

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(new Date(iso));
  } catch {
    return "";
  }
};

export default function Blogs() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,title,slug,excerpt,cover_url,status,tags,created_at,published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
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
    load();
  }, []);

  const allTags = useMemo(() => {
    const s = new Set();
    rows.forEach((r) => {
      const tags = Array.isArray(r.tags) ? r.tags : [];
      tags.forEach((t) => s.add(String(t)));
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const t = String(r.title || "").toLowerCase();
      const ex = String(r.excerpt || "").toLowerCase();
      const matchesQ = !query || t.includes(query) || ex.includes(query);
      const tags = Array.isArray(r.tags) ? r.tags : [];
      const matchesTag = !tag || tags.includes(tag);
      return matchesQ && matchesTag;
    });
  }, [rows, q, tag]);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/blogs", label: "Blogs" },
    { to: "/faqs", label: "FAQs" },
    { to: "/news", label: "News" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        :root{
          --primary:#4f46e5;
          --primary-dark:#4338ca;
          --dark:#0f172a;
          --gray:#64748b;
          --light:#f8fafc;
          --border:#e2e8f0;
          --shadow:0 12px 26px rgba(15,23,42,0.10);
        }

        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent; min-width:0;}
        html,body{
          font-family:'Plus Jakarta Sans',sans-serif;
          background:#fff;
          color:var(--dark);
          overflow-x:hidden;
          width:100%;
        }
        img, svg { max-width:100%; height:auto; }

        .container{
          width:100%;
          max-width:1280px;
          margin:0 auto;
          padding:0 24px;
        }
        @media(max-width:768px){
          .container{ padding:0 10px; }
        }

        /* NAVBAR */
        .navbar{
          position:fixed;top:0;left:0;right:0;z-index:1000;
          padding:14px 0;transition:.25s ease;border-bottom:1px solid transparent;
          background:transparent;
        }
        .navbar.scrolled{
          background:rgba(255,255,255,0.92);
          backdrop-filter:blur(12px);
          border-bottom:1px solid var(--border);
          padding:10px 0;
        }
        .nav-inner{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .nav-logo{display:flex;align-items:center;gap:10px;cursor:pointer;text-decoration:none}
        .logo-text{font-weight:950;font-size:1.25rem;letter-spacing:-0.03em;color:var(--dark)}
        .nav-desktop{display:flex;align-items:center;gap:22px}
        .nav-link{text-decoration:none;color:var(--gray);font-weight:900;font-size:.95rem}
        .nav-link:hover{color:var(--primary)}
        .nav-actions{display:flex;gap:10px;align-items:center}

        .btn{
          border:0;cursor:pointer;font-weight:950;
          border-radius:999px;padding:10px 16px;
          transition:.18s ease;display:inline-flex;align-items:center;justify-content:center;gap:8px;
          text-decoration:none; line-height:1;
          max-width:100%;
        }
        .btn-primary{
          background:linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%);
          color:#fff;box-shadow:0 10px 22px rgba(79,70,229,0.30);
        }
        .btn-secondary{background:#fff;color:var(--dark);border:1px solid var(--border)}
        .btn-secondary:hover{background:var(--light)}
        .mobile-toggle{display:none;background:none;border:0;cursor:pointer;color:var(--dark);padding:8px}

        @media(max-width:768px){
          .nav-desktop,.nav-actions{display:none}
          .mobile-toggle{display:block}
        }

        .nav-drawer{
          position:absolute;top:100%;left:0;width:100%;
          background:#fff;border-top:1px solid var(--border);
          box-shadow:var(--shadow);
          transform-origin:top;
          transform:scaleY(0);
          opacity:0;
          transition:transform .22s ease,opacity .22s ease;
          overflow:hidden;
        }
        .nav-drawer.open{transform:scaleY(1);opacity:1}
        .drawer-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border)}
        .drawer-item{background:#fff;padding:16px;text-align:center;font-weight:950;color:var(--dark);text-decoration:none}
        .drawer-actions{
          padding:14px 10px;display:flex;flex-direction:column;gap:10px;
          padding-bottom:max(14px, env(safe-area-inset-bottom))
        }

        /* PAGE */
        main.page{
          width:100%;
          overflow-x:hidden;
          padding-top:92px;
          padding-bottom:64px;
          background:linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #ffffff 100%);
        }

        .hero{
          position:relative;
          width:100%;
          border-radius:20px;
          padding:14px;
          border:1px solid var(--border);
          background:linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(14,165,233,0.06) 100%);
          overflow:hidden;
        }
        @media(min-width:769px){
          .hero{padding:26px;border-radius:24px}
        }
        .hero::before{
          content:"";
          position:absolute;
          inset:0;
          background:
            radial-gradient(circle at 18% 22%, rgba(79,70,229,0.18), transparent 55%),
            radial-gradient(circle at 82% 28%, rgba(14,165,233,0.16), transparent 55%);
          filter:blur(10px);
          opacity:.9;
          transform:scale(1.25);
        }
        .hero > *{position:relative;z-index:1}

        .title{
          font-size:clamp(1.55rem, 5.4vw, 2.4rem);
          font-weight:980;
          letter-spacing:-0.04em;
          margin-bottom:8px;
        }
        .subtitle{color:var(--gray);line-height:1.65;font-weight:750;font-size:.95rem}

        .controls{
          margin-top:14px;
          display:grid;
          grid-template-columns:1fr;
          gap:10px;
        }
        @media(min-width:769px){
          .controls{grid-template-columns:1.2fr .8fr}
        }
        .inputWrap{position:relative}
        .inputIcon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#64748b}
        .input,.select{
          width:100%;
          box-sizing:border-box;
          padding:12px 12px 12px 40px;
          border-radius:14px;
          border:1px solid #e2e8f0;
          outline:none;
          font-weight:850;
          color:var(--dark);
          background:#fff;
        }
        .select{appearance:none}
        .input:focus,.select:focus{
          border-color:rgba(79,70,229,0.55);
          box-shadow:0 0 0 4px rgba(79,70,229,0.12);
        }

        .listHeader{
          margin-top:14px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          flex-wrap:wrap;
        }
        .countPill{
          display:inline-flex;align-items:center;gap:8px;
          padding:8px 12px;border-radius:999px;
          background:#fff;border:1px solid var(--border);
          font-weight:950;color:#0f172a;
          box-shadow:0 8px 18px rgba(15,23,42,0.06);
        }

        .grid{
          margin-top:12px;
          display:grid;
          grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));
          gap:12px;
        }

        .card{
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 10px 22px rgba(0,0,0,0.04);
          display:flex;
          flex-direction:column;
          min-width:0;
          cursor:pointer;
          transition:.2s ease;
        }
        .card:hover{
          transform:translateY(-3px);
          box-shadow:0 16px 30px rgba(15,23,42,0.10);
          border-color:rgba(79,70,229,0.35);
        }

        .cover{
          width:100%;
          height:160px;
          background:linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(59,130,246,0.10) 100%);
          border-bottom:1px solid #eef2f7;
          display:flex;align-items:center;justify-content:center;
          color:#64748b;font-weight:950;letter-spacing:-0.02em;
        }
        .img{width:100%;height:100%;object-fit:cover;display:block}

        .body{padding:14px;display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}
        .cardTitle{
          margin:0;
          font-size:15px;
          font-weight:980;
          color:#0f172a;
          line-height:1.25;
          letter-spacing:-0.02em;
        }
        .excerpt{
          margin:0;
          font-size:13px;
          font-weight:750;
          color:#475569;
          line-height:1.65;
        }

        .meta{
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap:10px;
          margin-top:auto;
          padding-top:10px;
          border-top:1px dashed #e5e7eb;
        }
        .tagRow{display:flex;gap:6px;flex-wrap:wrap;max-width:70%}
        .tagPill{
          font-size:11px;
          font-weight:950;
          color:#1d4ed8;
          background:#eff6ff;
          border:1px solid #bfdbfe;
          padding:4px 8px;
          border-radius:999px;
          white-space:nowrap;
        }
        .dateRow{
          display:inline-flex;align-items:center;gap:6px;
          font-size:12px;font-weight:950;color:#64748b;
          white-space:nowrap;
        }

        .alert{
          margin-top:12px;
          border-radius:16px;
          padding:14px;
          font-weight:850;
          font-size:13px;
          line-height:1.5;
          border:1px solid #e2e8f0;
          background:#fff;
          box-shadow:0 10px 18px rgba(15,23,42,0.06);
        }
        .alert.error{
          background:#fef2f2;
          border-color:#fecaca;
          color:#991b1b;
        }

        .skeletonGrid{
          margin-top:12px;
          display:grid;
          grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));
          gap:12px;
        }
        .skel{
          border:1px solid #e5e7eb;border-radius:18px;
          background:#fff;overflow:hidden;
          box-shadow:0 10px 22px rgba(0,0,0,0.04);
        }
        .skelTop{height:160px;background:linear-gradient(90deg,#f1f5f9, #e2e8f0, #f1f5f9);background-size:200% 100%;animation:shimmer 1.2s infinite}
        .skelBody{padding:14px}
        .skelLine{height:12px;border-radius:999px;background:linear-gradient(90deg,#f1f5f9, #e2e8f0, #f1f5f9);background-size:200% 100%;animation:shimmer 1.2s infinite;margin-bottom:10px}
        .skelLine.sm{width:65%}
        .skelLine.md{width:85%}
        .skelLine.lg{width:95%}
        @keyframes shimmer{0%{background-position:0% 0%}100%{background-position:200% 0%}}

        footer{
          border-top:1px solid var(--border);
          padding:60px 0 26px;
          background:#fff;
        }
        .footerGrid{
          display:grid;gap:26px;
          grid-template-columns:1fr;
          margin-bottom:32px;
        }
        @media(min-width:900px){.footerGrid{grid-template-columns:2fr 1fr 1fr}}
        .footerTitle{font-weight:980;margin-bottom:14px}
        .footerLink{display:block;text-decoration:none;color:var(--gray);font-weight:900;margin-bottom:10px}
        .footerLink:hover{color:var(--primary)}
      `}</style>

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <div className="nav-logo" onClick={() => navigate("/")}>
            <img src={logo} alt="AIDLA" style={{ height: 34, width: 34, borderRadius: 10, objectFit: "contain" }} />
            <span className="logo-text">AIDLA</span>
          </div>

          <div className="nav-desktop">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className="nav-link"
                style={({ isActive }) => (isActive ? { color: "var(--primary)" } : undefined)}
              >
                {n.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            <button onClick={() => navigate("/Login")} className="btn btn-secondary">
              Login <Icons.ArrowRight />
            </button>
            <button onClick={() => navigate("/signup")} className="btn btn-primary">
              Join Free <Icons.ArrowRight />
            </button>
          </div>

          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen((s) => !s)}>
            {isMobileMenuOpen ? <Icons.ChevronUp /> : <Icons.Menu />}
          </button>
        </div>

        <div className={`nav-drawer ${isMobileMenuOpen ? "open" : ""}`}>
          <div className="drawer-grid">
            {navItems.map((n) => (
              <Link key={n.to} to={n.to} className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>
                {n.label}
              </Link>
            ))}
          </div>

          <div className="drawer-actions">
            <button
              onClick={() => { navigate("/dashboard"); setIsMobileMenuOpen(false); }}
              className="btn btn-secondary"
              style={{ width: "100%" }}
            >
              Login <Icons.ArrowRight />
            </button>
            <button
              onClick={() => { navigate("/signup"); setIsMobileMenuOpen(false); }}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Create Account <Icons.ArrowRight />
            </button>
          </div>
        </div>
      </nav>

      {/* PAGE */}
      <main className="page">
        <div className="container">
          <section className="hero">
            <h1 className="title">Blogs</h1>
            <p className="subtitle">
              Updates, guides, announcements, and learning tips — all in one place.
            </p>

            <div className="controls">
              <div className="inputWrap">
                <div className="inputIcon"><Icons.Search /></div>
                <input
                  className="input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search posts..."
                  type="text"
                />
              </div>

              <div className="inputWrap">
                <div className="inputIcon"><Icons.Tag /></div>
                <select className="select" value={tag} onChange={(e) => setTag(e.target.value)}>
                  <option value="">All tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="listHeader">
              <div className="countPill">
                <span>Showing</span>
                <span style={{ color: "var(--primary)" }}>{filtered.length}</span>
                <span>post(s)</span>
              </div>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={load}
                style={{ padding: "10px 14px" }}
              >
                Refresh
              </button>
            </div>
          </section>

          {err ? <div className="alert error">{err}</div> : null}

          {loading ? (
            <section className="skeletonGrid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="skel" key={i}>
                  <div className="skelTop" />
                  <div className="skelBody">
                    <div className="skelLine lg" />
                    <div className="skelLine md" />
                    <div className="skelLine sm" />
                  </div>
                </div>
              ))}
            </section>
          ) : filtered.length === 0 ? (
            <div className="alert">
              No posts found. Try a different keyword or tag.
            </div>
          ) : (
            <section className="grid">
              {filtered.map((p) => {
                const tags = Array.isArray(p.tags) ? p.tags : [];
                return (
                  <article
                    key={p.id}
                    className="card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/blogs/${p.slug}`)}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/blogs/${p.slug}`)}
                    aria-label={`Open blog post ${p.title}`}
                  >
                    <div className="cover">
                      {p.cover_url ? <img src={p.cover_url} alt={p.title} className="img" /> : "AIDLA"}
                    </div>

                    <div className="body">
                      <h3 className="cardTitle">{p.title}</h3>
                      <p className="excerpt">{p.excerpt || "Read more…"}</p>

                      <div className="meta">
                        <div className="tagRow">
                          {tags.slice(0, 3).map((t) => (
                            <span key={t} className="tagPill">{t}</span>
                          ))}
                        </div>

                        <div className="dateRow">
                          <Icons.Clock />
                          {fmtDate(p.published_at || p.created_at)}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {/* FOOTER */}
          <footer style={{ marginTop: 26 }}>
            <div className="footerGrid">
              <div>
                <div className="nav-logo" style={{ marginBottom: 12 }}>
                  <img src={logo} alt="AIDLA" style={{ height: 32, width: 32, borderRadius: 10 }} />
                  <span className="logo-text">AIDLA</span>
                </div>
                <div style={{ color: "var(--gray)", fontWeight: 850, lineHeight: 1.7, maxWidth: 520 }}>
                  The AI-first learning ecosystem where knowledge becomes rewards.
                </div>
              </div>

              <div>
                <div className="footerTitle">Platform</div>
                <Link className="footerLink" to="/courses">Courses</Link>
                <Link className="footerLink" to="/tests">Competitions</Link>
                <Link className="footerLink" to="/rewards">Rewards</Link>
              </div>

              <div>
                <div className="footerTitle">Company</div>
                <Link className="footerLink" to="/about">About</Link>
                <Link className="footerLink" to="/contact">Contact</Link>
                <Link className="footerLink" to="/faqs">FAQs</Link>
              </div>
            </div>

            <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--gray)", fontWeight: 900 }}>
              © {new Date().getFullYear()} AIDLA Inc. All rights reserved.
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
