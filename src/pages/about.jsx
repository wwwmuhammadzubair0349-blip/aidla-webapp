import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.jpg";

// --- HEAD COMPONENT ---
const Head = () => {
  useEffect(() => {
    document.title = "About AIDLA | The AI-First Learning Ecosystem";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content =
      "Learn about AIDLA's mission to transform learning into earning with AI-powered education and tangible rewards.";
    return () => { document.title = "AIDLA"; };
  }, []);
  return null;
};

// --- ICONS ---
const Icons = {
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Play: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
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
  Target: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Globe: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Rocket: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8v1a2 2 0 0 1-2 2h-2l-4 4-4-4H6a2 2 0 0 1-2-2v-1Z" />
      <path d="M12 9h.01" />
    </svg>
  ),
};

// --- MAIN ABOUT COMPONENT ---
export default function About() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);

      // ✅ Your new timeline
      const newMilestones = [
        { id: 1, year: "2025", title: "Idea Born", description: "AIDLA concept started — learning should be simple, rewarding, and accessible." },
        { id: 2, year: "2026", title: "Shaped Into Website", description: "AIDLA became a real platform — website development, core systems and reward model." },
        { id: 3, year: "2027", title: "Planning for App", description: "Planning and designing the mobile app experience for faster, smoother learning and earning." },
        { id: 4, year: "2028", title: "Educational Partnerships", description: "Partnerships with educational institutes to expand trust, content, and opportunities." },
        { id: 5, year: "2029", title: "Physical Branches", description: "Opening physical branches to support learners, communities, and training programs." },
      ];
      setMilestones(newMilestones);

    } catch (error) {
      console.error("Error fetching about data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading About Page...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --primary: #4f46e5;
          --primary-hover: #4338ca;
          --secondary: #0ea5e9;
          --dark: #0f172a;
          --gray: #64748b;
          --light-gray: #f1f5f9;
          --white: #ffffff;
          --border: #e2e8f0;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --radius-lg: 20px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        html, body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--white);
          color: var(--dark);
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .blob-anim { animation: blob 10s infinite alternate; }

        .container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 768px) { .container { padding: 0 16px; } }

        .section { padding: 92px 0; position: relative; }
        @media (max-width: 768px) { .section { padding: 64px 0; } }

        .bg-slate { background-color: #f8fafc; }

        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 28px; border-radius: 999px; font-weight: 700; font-size: 1rem;
          cursor: pointer; transition: all 0.2s ease; border: none; text-decoration: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%);
          color: white; box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(79, 70, 229, 0.45); }
        .btn-secondary { background: white; color: var(--dark); border: 1px solid var(--border); }
        .btn-secondary:hover { background: var(--light-gray); border-color: var(--gray); }
        .btn-white { background: white; color: var(--primary); }
        .btn-outline { background: transparent; border: 2px solid rgba(255,255,255,0.3); color: white; }
        .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: white; }

        .card {
          background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 32px; transition: all 0.3s ease;
          position: relative; overflow: hidden; height: 100%; display: flex; flex-direction: column;
        }
        .card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: rgba(79, 70, 229, 0.25); }

        .badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px;
          border-radius: 999px; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.02em;
        }

        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          transition: all 0.3s ease; border-bottom: 1px solid transparent;
          padding: 16px 0;
        }
        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border); padding: 12px 0;
          box-shadow: var(--shadow-sm);
        }
        .nav-container { display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; z-index: 1001; }
        .logo-text { font-weight: 900; font-size: 1.4rem; color: var(--dark); letter-spacing: -0.03em; }

        .nav-desktop { display: flex; gap: 28px; align-items: center; }
        .nav-link { text-decoration: none; color: var(--gray); font-weight: 700; font-size: 0.95rem; transition: color 0.2s; }
        .nav-link:hover { color: var(--primary); }

        .mobile-toggle { display: none; background: none; border: none; cursor: pointer; color: var(--dark); z-index: 1002; padding: 8px; }

        .nav-drawer {
          position: absolute; top: 100%; left: 0; width: 100%;
          background: white; border-top: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          padding: 0 0 40px 0;
          transform-origin: top;
          transform: scaleY(0);
          opacity: 0;
          transition: transform 0.25s ease, opacity 0.25s ease;
          z-index: 999;
          overflow: hidden;
        }
        .nav-drawer.open { transform: scaleY(1); opacity: 1; }
        .nav-drawer-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--border); }
        .nav-drawer-item {
          background: white; padding: 18px; text-align: center;
          text-decoration: none; color: var(--dark); font-weight: 800;
        }
        .nav-drawer-item:active { background: var(--light-gray); }

        .mobile-actions {
          padding: 22px 16px; display: flex; flex-direction: column; gap: 12px;
          padding-bottom: max(24px, env(safe-area-inset-bottom));
        }

        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 22px; }

        .icon-box {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
        }

        .loading-container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        .loading-text { color: var(--gray); margin-top: 16px; font-weight: 700; }

        @media (max-width: 768px) {
          .nav-desktop { display: none; }
          .mobile-toggle { display: block; }
          .section { padding: 56px 0; }
          .grid-3 { grid-template-columns: 1fr; }
        }

        /* Timeline */
        .timeline { position: relative; padding-left: 40px; }
        .timeline::before {
          content: '';
          position: absolute;
          left: 20px; top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, var(--primary), var(--secondary));
        }
        .timeline-item { position: relative; margin-bottom: 34px; }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -30px; top: 10px;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: var(--primary);
          border: 3px solid white;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.20);
        }

        .value-icon {
          width: 64px; height: 64px;
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
        }
      `}</style>

      <Head />

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-container">
          <div className="nav-logo" onClick={() => navigate("/")}>
            <img src={logo} alt="AIDLA" style={{ height: 36, width: 36, borderRadius: 10, objectFit: "contain" }} />
            <span className="logo-text">AIDLA</span>
          </div>

          <div className="nav-desktop">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/blogs" className="nav-link">Blogs</Link>
            <Link to="/faqs" className="nav-link">FAQs</Link>
          </div>

          <div className="nav-desktop">
            <button onClick={() => navigate("/login")} className="btn btn-secondary" style={{ padding: "10px 22px" }}>Login</button>
            <button onClick={() => navigate("/signup")} className="btn btn-primary" style={{ padding: "10px 22px" }}>Signup</button>
          </div>

          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <Icons.ChevronUp /> : <Icons.Menu />}
          </button>
        </div>

        <div className={`nav-drawer ${isMobileMenuOpen ? "open" : ""}`}>
          <div className="nav-drawer-grid">
            <Link to="/" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            <Link to="/blogs" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
            <Link to="/faqs" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>FAQs</Link>
            <Link to="/news" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
          </div>
          <div className="mobile-actions">
            <button onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }} className="btn btn-secondary" style={{ width: "100%" }}>
              Login
            </button>
            <button onClick={() => { navigate("/signup"); setIsMobileMenuOpen(false); }} className="btn btn-primary" style={{ width: "100%" }}>
              Create Account
            </button>
          </div>
        </div>
      </nav>

      <div>
        {/* HERO */}
        <section className="section" style={{ paddingTop: "140px" }}>
          <div className="blob-anim" style={{ position: "absolute", background: "#e0e7ff", width: 600, height: 600, top: "-10%", left: "-10%", borderRadius: "50%", filter: "blur(90px)", opacity: 0.55 }} />
          <div className="blob-anim" style={{ position: "absolute", background: "#f3e8ff", width: 520, height: 520, bottom: "-10%", right: "-5%", borderRadius: "50%", filter: "blur(90px)", opacity: 0.55, animationDelay: "2s" }} />

          <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
            <div className="animate-fade-in">
              <span className="badge" style={{ background: "#e0e7ff", color: "var(--primary)", marginBottom: 18, fontWeight: 900 }}>
                🚀 Our Story & Mission
              </span>
            </div>

            <h1 className="animate-fade-in delay-1" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 14 }}>
              Redefining Learning<br />
              <span style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Through AI & Rewards
              </span>
            </h1>

            <p className="animate-fade-in delay-2" style={{ color: "var(--gray)", fontSize: "1.12rem", lineHeight: 1.7, maxWidth: 860, margin: "0 auto 26px" }}>
              AIDLA was born from a simple idea: learning should be as engaging as gaming and as rewarding as investing.
              We’re building an AI-powered learning ecosystem that helps people grow skills and earn real rewards.
            </p>

            <div className="animate-fade-in delay-3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/signup")} className="btn btn-primary" style={{ padding: "16px 40px", fontSize: "1.05rem" }}>
                Join Our Mission <Icons.ChevronRight />
              </button>
              <button onClick={() => navigate("/contact")} className="btn btn-secondary" style={{ padding: "16px 40px", fontSize: "1.05rem" }}>
                <Icons.Play /> Watch Our Story
              </button>
            </div>
          </div>
        </section>

        {/* MISSION / VISION / IMPACT */}
        <section className="section bg-slate">
          <div className="container">
            <div className="grid-3">
              <div className="card">
                <div className="icon-box" style={{ background: "rgba(79, 70, 229, 0.10)", color: "var(--primary)" }}>
                  <Icons.Target />
                </div>
                <h3 style={{ fontSize: "1.45rem", fontWeight: 900, marginBottom: 14 }}>Our Mission</h3>
                <p style={{ color: "var(--gray)", lineHeight: 1.7 }}>
                  Make learning simple, practical, and rewarding — so people can build skills and earn while they learn.
                </p>
              </div>

              <div className="card">
                <div className="icon-box" style={{ background: "rgba(14, 165, 233, 0.10)", color: "var(--secondary)" }}>
                  <Icons.Zap />
                </div>
                <h3 style={{ fontSize: "1.45rem", fontWeight: 900, marginBottom: 14 }}>Our Vision</h3>
                <p style={{ color: "var(--gray)", lineHeight: 1.7 }}>
                  To make <b>AIDLA a global brand</b>, make learning easy, and enable people to <b>earn while they learn</b>.
                </p>
              </div>

              <div className="card">
                <div className="icon-box" style={{ background: "rgba(34, 197, 94, 0.10)", color: "#22c55e" }}>
                  <Icons.Globe />
                </div>
                <h3 style={{ fontSize: "1.45rem", fontWeight: 900, marginBottom: 14 }}>Our Goal</h3>
                <p style={{ color: "var(--gray)", lineHeight: 1.7 }}>
                  Build a trusted ecosystem with AI learning, rewards, and partnerships that supports students worldwide — online and offline.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>Our Journey</h2>
              <p style={{ color: "var(--gray)", fontSize: "1.1rem", maxWidth: 640, margin: "0 auto" }}>
                Clear roadmap from idea to global impact.
              </p>
            </div>

            <div style={{ maxWidth: 860, margin: "0 auto" }}>
              <div className="timeline">
                {milestones.map((m, index) => (
                  <div key={m.id} className="timeline-item">
                    <div className="card" style={{ background: index % 2 === 0 ? "white" : "#f8fafc" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
                        <div style={{
                          background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                          color: "white",
                          padding: "8px 18px",
                          borderRadius: "999px",
                          fontWeight: 900,
                          fontSize: "0.9rem"
                        }}>
                          {m.year}
                        </div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 900 }}>{m.title}</h3>
                      </div>
                      <p style={{ color: "var(--gray)", lineHeight: 1.7 }}>{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="section bg-slate">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>Our Core Values</h2>
              <p style={{ color: "var(--gray)", fontSize: "1.1rem" }}>
                Principles that guide AIDLA.
              </p>
            </div>

            <div className="grid-3">
              <div className="card" style={{ textAlign: "center" }}>
                <div className="value-icon"><Icons.Heart /></div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: 10 }}>Learner First</h3>
                <p style={{ color: "var(--gray)", lineHeight: 1.7 }}>
                  We build everything around learners — clarity, speed, and results.
                </p>
              </div>

              <div className="card" style={{ textAlign: "center" }}>
                <div className="value-icon"><Icons.Shield /></div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: 10 }}>Trust & Transparency</h3>
                <p style={{ color: "var(--gray)", lineHeight: 1.7 }}>
                  Fair systems, honest rules, and clear reward logic — trust is everything.
                </p>
              </div>

              <div className="card" style={{ textAlign: "center" }}>
                <div className="value-icon"><Icons.Rocket /></div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: 10 }}>Innovation</h3>
                <p style={{ color: "var(--gray)", lineHeight: 1.7 }}>
                  AI-driven learning + rewards to create a new standard for education.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)", padding: "96px 18px", textAlign: "center", color: "white" }}>
          <div className="container" style={{ maxWidth: 840 }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 18 }}>Join Our Learning Revolution</h2>
            <p style={{ fontSize: "1.2rem", marginBottom: 36, opacity: 0.92, lineHeight: 1.7 }}>
              Learn easier. Grow faster. Earn while learning — with AIDLA.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/signup")} className="btn btn-white" style={{ padding: "16px 40px", fontSize: "1.05rem" }}>
                Start Learning Free
              </button>
              <button onClick={() => navigate("/contact")} className="btn btn-outline" style={{ padding: "16px 40px", fontSize: "1.05rem" }}>
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid var(--border)", padding: "80px 0 30px", background: "var(--white)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 60 }}>
              <div>
                <div className="nav-logo" style={{ marginBottom: 20, display: "inline-flex" }}>
                  <img src={logo} alt="AIDLA" style={{ height: 32, width: 32, borderRadius: 8 }} />
                  <span className="logo-text">AIDLA</span>
                </div>
                <p style={{ color: "var(--gray)", lineHeight: 1.7, maxWidth: 320 }}>
                  The AI-first learning ecosystem where knowledge is the ultimate currency.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 900, marginBottom: 18, color: "var(--dark)" }}>Platform</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to="/courses" style={{ color: "var(--gray)", textDecoration: "none" }}>Courses</Link>
                  <Link to="/tests" style={{ color: "var(--gray)", textDecoration: "none" }}>Competitions</Link>
                  <Link to="/rewards" style={{ color: "var(--gray)", textDecoration: "none" }}>Rewards Store</Link>
                  <Link to="/leaderboard" style={{ color: "var(--gray)", textDecoration: "none" }}>Leaderboard</Link>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 900, marginBottom: 18, color: "var(--dark)" }}>Company</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to="/about" style={{ color: "var(--gray)", textDecoration: "none" }}>About Us</Link>
                  <Link to="/blogs" style={{ color: "var(--gray)", textDecoration: "none" }}>Blog</Link>
                  <Link to="/contact" style={{ color: "var(--gray)", textDecoration: "none" }}>Contact</Link>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 900, marginBottom: 18, color: "var(--dark)" }}>Legal</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to="/terms" style={{ color: "var(--gray)", textDecoration: "none" }}>Terms of Service</Link>
                  <Link to="/privacy" style={{ color: "var(--gray)", textDecoration: "none" }}>Privacy Policy</Link>
                  <Link to="/cookies" style={{ color: "var(--gray)", textDecoration: "none" }}>Cookie Policy</Link>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 28, borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--gray)", fontSize: "0.92rem", fontWeight: 800 }}>
              © {new Date().getFullYear()} AIDLA Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
