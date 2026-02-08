import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
  ChevronDown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
};

function useSEO({ title, description, canonicalPath, faqJsonLd }) {
  useEffect(() => {
    // Title
    const prevTitle = document.title;
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Robots (allow indexing)
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "index,follow");

    // Canonical (helps duplicate issues)
    const fullCanonical =
      canonicalPath && typeof window !== "undefined"
        ? `${window.location.origin}${canonicalPath}`
        : null;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    if (fullCanonical) canonical.setAttribute("href", fullCanonical);

    // JSON-LD FAQ Schema
    let ld = document.getElementById("faq-jsonld");
    if (!ld) {
      ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.id = "faq-jsonld";
      document.head.appendChild(ld);
    }
    ld.text = JSON.stringify(faqJsonLd);

    return () => {
      document.title = prevTitle;
      // keep meta tags (safe). If you want remove on unmount, you can.
    };
  }, [title, description, canonicalPath, faqJsonLd]);
}

export default function FAQs() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [openIdx, setOpenIdx] = useState(0);
  const [q, setQ] = useState("");

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/blogs", label: "Blogs" },
    { to: "/faqs", label: "FAQs" },
    { to: "/news", label: "News" },
  ];

  const faqs = useMemo(
    () => [
      // --- General
      { q: "What is AIDLA?", a: "AIDLA is an AI-first learning ecosystem designed to make learning easy and help people earn while they learn." },
      { q: "Is AIDLA free to use?", a: "Yes, you can start learning for free. Some premium features and future programs may have optional paid plans." },
      { q: "Who is AIDLA for?", a: "For students, job-seekers, professionals, and anyone who wants structured learning and rewards for progress." },
      { q: "What makes AIDLA different?", a: "AIDLA combines AI-guided learning, progress tracking, gamification, and reward opportunities in one ecosystem." },
      { q: "Which countries can use AIDLA?", a: "AIDLA is built to be global. Availability of some features may vary by country due to partners and policies." },

      // --- Accounts
      { q: "How do I create an account?", a: "Go to Signup, enter your details, and verify your email if required." },
      { q: "I forgot my password. What should I do?", a: "Use the Forgot Password option on the Login page to reset your password." },
      { q: "Can I change my email address?", a: "Yes, from your account/profile settings (depending on enabled features)." },
      { q: "How do I delete my account?", a: "Contact support through the Contact page and request account deletion." },
      { q: "Is my data safe?", a: "We follow best practices for authentication and secure storage. Never share your password with anyone." },

      // --- Learning
      { q: "What can I learn on AIDLA?", a: "Courses, skills, quizzes, exams, and practical learning paths (based on what you publish on the platform)." },
      { q: "Do you provide certificates?", a: "Certificates may be available for specific courses or partner programs (based on future releases)." },
      { q: "Do I need prior knowledge to start?", a: "No. AIDLA supports beginners and provides step-by-step learning paths." },
      { q: "Can I learn from mobile?", a: "Yes, the website is mobile responsive. A dedicated app is planned in future years." },
      { q: "How does the AI help me?", a: "AI can personalize recommendations, suggest learning paths, and help you practice with guidance." },

      // --- Rewards & Earnings (conceptual; keep compliant + realistic)
      { q: "How can I earn while learning?", a: "AIDLA is building reward systems around verified progress, activities, competitions, and partner programs." },
      { q: "Are rewards guaranteed?", a: "No. Rewards depend on eligibility rules, your activity, and available partner campaigns." },
      { q: "What types of rewards are possible?", a: "Digital rewards, vouchers, discounts, and other benefits depending on partner availability." },
      { q: "Do rewards expire?", a: "Some rewards may have expiration dates. Details will be shown inside your rewards section." },
      { q: "Can I transfer rewards to another user?", a: "Transfer rules depend on the reward type. Some may be non-transferable." },

      // --- Competitions / Tests
      { q: "What are competitions/tests?", a: "Skill-based assessments designed to help you measure progress and qualify for rewards or rankings." },
      { q: "Are tests timed?", a: "Some tests may be timed, others may not. The test page will show timing rules." },
      { q: "Can I retake a test?", a: "Retake rules depend on the test. Some allow immediate retakes, others have cooldowns." },
      { q: "How is the leaderboard calculated?", a: "Based on performance metrics like scores, completions, streaks, and verified achievements." },
      { q: "How do you prevent cheating?", a: "We apply technical and policy-based measures to detect suspicious activity and protect fairness." },

      // --- Payments
      { q: "Does AIDLA have paid plans?", a: "AIDLA may introduce premium plans as the platform grows. Free learning remains a core priority." },
      { q: "Can I get a refund?", a: "Refund policies will be shown clearly when paid plans/features are launched." },
      { q: "Which payment methods are supported?", a: "Payment methods depend on the region and provider used at the time of launch." },
      { q: "Do you store my card details?", a: "Typically payment providers handle card data. AIDLA aims to avoid storing sensitive payment data directly." },

      // --- Technical
      { q: "Which browsers are supported?", a: "Modern browsers like Chrome, Edge, Safari, and Firefox are supported." },
      { q: "The site looks broken on my phone. What do I do?", a: "Refresh, clear cache, try another browser, and contact support with a screenshot." },
      { q: "Why am I not receiving verification emails?", a: "Check spam/junk folders, confirm your email address, and try resending." },
      { q: "How do I report a bug?", a: "Use the Contact page and include steps to reproduce and a screenshot." },
      { q: "Does AIDLA have an API?", a: "Not public yet. Admin/partner integrations may come later." },

      // --- Content / Policies
      { q: "Can I publish my own blogs on AIDLA?", a: "Depending on your role/permissions, you may publish content through the platform tools." },
      { q: "What content is not allowed?", a: "Hate, harassment, illegal content, spam, plagiarism, and content violating rights or policies." },
      { q: "How do you handle plagiarism?", a: "We may remove content and restrict accounts when plagiarism is confirmed." },
      { q: "Can I request removal of my content?", a: "Yes, contact support and share the link or details of the content." },
      { q: "Do you use cookies?", a: "Yes, cookies may be used for sessions, security, and improving experience." },

      // --- Partnerships & Business
      { q: "How can institutes partner with AIDLA?", a: "Use the Contact page and select partnerships in your message. We’ll respond with next steps." },
      { q: "Do you offer white-label solutions?", a: "This may be available in future depending on demand and product roadmap." },
      { q: "Can companies post jobs or internships?", a: "Job/internship partnerships may be supported later as the platform expands." },
      { q: "Do you offer campus programs?", a: "Planned for future phases with partner institutions." },
      { q: "Can I become an instructor?", a: "Instructor onboarding may open later. Start by contacting us with your profile and expertise." },

      // --- Roadmap (your timeline)
      { q: "When was AIDLA’s idea born?", a: "The idea was born in 2025." },
      { q: "When did AIDLA start shaping into a website?", a: "The plan is to shape AIDLA into a complete website in 2026." },
      { q: "When is the AIDLA mobile app planned?", a: "App planning is targeted for 2027." },
      { q: "When will AIDLA partner with educational institutes?", a: "Partnership expansion is planned for 2028." },
      { q: "When will AIDLA open physical branches?", a: "Physical branches are planned for 2029." },

      // --- Support
      { q: "How do I contact support?", a: "Open the Contact page and send your message. You’ll receive a confirmation." },
      { q: "How fast do you reply?", a: "Response time depends on volume, but we aim to respond as soon as possible." },
      { q: "Can I request a feature?", a: "Yes. Send your suggestion via Contact and include why it matters." },
      { q: "I found a security issue. How do I report it?", a: "Use the Contact page and mark your message as a security report." },

      // --- More FAQs (to reach 50+)
      { q: "Can I use AIDLA for exam preparation?", a: "Yes. AIDLA can support exam-style practice through quizzes and structured paths." },
      { q: "Does AIDLA support multiple languages?", a: "Multi-language support may expand over time based on demand." },
      { q: "Can I learn at my own pace?", a: "Yes. You can learn anytime and track progress at your pace." },
      { q: "Will AIDLA work on slow internet?", a: "We aim to keep pages lightweight, but media content may require better connectivity." },
      { q: "Do you provide offline mode?", a: "Not yet. Offline features may come later, especially with the app roadmap." },
      { q: "How do I get featured on the leaderboard?", a: "Complete activities consistently, perform well in tests, and maintain your learning streak." },
      { q: "Can I change my username?", a: "If enabled, you can change it in profile settings." },
      { q: "How do I update my profile?", a: "Go to your dashboard/profile and edit your details." },
      { q: "What is a learning streak?", a: "A streak tracks consistent daily or weekly learning activity." },
      { q: "Do you provide mentorship?", a: "Mentorship programs may be added through partners and community features." },
      { q: "Is AIDLA suitable for beginners?", a: "Yes. The platform is designed to guide beginners step-by-step." },
      { q: "Can I use AIDLA to improve job skills?", a: "Yes. Skill-focused learning paths are ideal for career growth." },
      { q: "How do you verify learning progress?", a: "Using quizzes, completions, activities, and future partner verification methods." },
      { q: "Can I share my achievements?", a: "Yes. You can share achievements and certificates where available." },
      { q: "Does AIDLA provide community features?", a: "Community features may expand in future versions." },
      { q: "Can schools use AIDLA for students?", a: "Yes, partnerships for institutes are part of the roadmap." },
      { q: "What is AIDLA’s vision?", a: "To make AIDLA a global brand, make learning easy, and enable people to earn while they learn." },
      { q: "Do you support internships through AIDLA?", a: "Potentially through future partnerships and talent programs." },
      { q: "Will AIDLA have physical training centers?", a: "Yes, physical branches are planned in 2029 as part of expansion." },
      { q: "Can I become a partner sponsor?", a: "Yes, contact us to discuss sponsorship opportunities." },
    ],
    []
  );

  const faqJsonLd = useMemo(() => {
    // Google recommends limiting, but 50+ is okay; still keep answers short.
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((f) => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a,
        },
      })),
    };
  }, [faqs]);

  useSEO({
    title: "FAQs | AIDLA — AI-First Learning & Earn While You Learn",
    description:
      "Find answers about AIDLA: AI learning, rewards, tests, accounts, partnerships, and roadmap. Learn how AIDLA helps you earn while you learn.",
    canonicalPath: "/faqs",
    faqJsonLd,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return faqs;
    return faqs.filter((f) => {
      const qq = String(f.q || "").toLowerCase();
      const aa = String(f.a || "").toLowerCase();
      return qq.includes(query) || aa.includes(query);
    });
  }, [faqs, q]);

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
          background:#fff;color:var(--dark);
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
        @media(max-width:768px){ .container{ padding:0 10px; } }

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
        @media(min-width:769px){ .hero{padding:26px;border-radius:24px} }
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

        .searchRow{
          margin-top:14px;
          display:grid;
          grid-template-columns:1fr;
          gap:10px;
        }
        .inputWrap{position:relative}
        .inputIcon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#64748b}
        .input{
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
        .input:focus{
          border-color:rgba(79,70,229,0.55);
          box-shadow:0 0 0 4px rgba(79,70,229,0.12);
        }

        .statsRow{
          margin-top:12px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          flex-wrap:wrap;
        }
        .pill{
          display:inline-flex;align-items:center;gap:8px;
          padding:8px 12px;border-radius:999px;
          background:#fff;border:1px solid var(--border);
          font-weight:950;color:#0f172a;
          box-shadow:0 8px 18px rgba(15,23,42,0.06);
        }

        .list{
          margin-top:12px;
          display:flex;
          flex-direction:column;
          gap:10px;
        }
        .qa{
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 10px 22px rgba(0,0,0,0.04);
        }
        .qBtn{
          width:100%;
          text-align:left;
          border:0;
          background:#fff;
          cursor:pointer;
          padding:14px 14px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          font-weight:950;
          color:#0f172a;
          line-height:1.35;
        }
        .qLeft{
          display:flex;
          align-items:flex-start;
          gap:10px;
          min-width:0;
        }
        .qIcon{
          width:34px;height:34px;border-radius:12px;
          display:flex;align-items:center;justify-content:center;
          background:rgba(79,70,229,0.10);color:var(--primary);
          flex:0 0 auto;
        }
        .qText{
          font-size:14px;
          letter-spacing:-0.01em;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .aWrap{
          border-top:1px solid #eef2f7;
          background:#f9fafb;
          padding:12px 14px 14px;
          color:#334155;
          line-height:1.75;
          font-weight:750;
          font-size:13px;
        }

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
            <button onClick={() => navigate("/login")} className="btn btn-secondary">Login</button>
            <button onClick={() => navigate("/signup")} className="btn btn-primary">Signup</button>
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
            <button onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }} className="btn btn-secondary" style={{ width: "100%" }}>
              Login
            </button>
            <button onClick={() => { navigate("/signup"); setIsMobileMenuOpen(false); }} className="btn btn-primary" style={{ width: "100%" }}>
              Create Account
            </button>
          </div>
        </div>
      </nav>

      {/* PAGE */}
      <main className="page">
        <div className="container">
          <section className="hero">
            <h1 className="title">Frequently Asked Questions</h1>
            <p className="subtitle">
              Everything you need to know about AIDLA — AI learning, rewards, tests, partnerships, and future plans.
            </p>

            <div className="searchRow">
              <div className="inputWrap">
                <div className="inputIcon"><Icons.Search /></div>
                <input
                  className="input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search FAQs..."
                  type="text"
                />
              </div>
            </div>

            <div className="statsRow">
              <div className="pill">
                <span>Showing</span>
                <span style={{ color: "var(--primary)" }}>{filtered.length}</span>
                <span>FAQ(s)</span>
              </div>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => { setQ(""); setOpenIdx(0); }}
                style={{ padding: "10px 14px" }}
              >
                Clear Search
              </button>
            </div>
          </section>

          <section className="list">
            {filtered.map((item, idx) => {
              const realIndex = faqs.findIndex((f) => f.q === item.q); // stable open
              const isOpen = openIdx === realIndex;

              return (
                <div key={item.q} className="qa">
                  <button
                    className="qBtn"
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? -1 : realIndex)}
                    aria-expanded={isOpen}
                  >
                    <div className="qLeft">
                      <span className="qIcon"><Icons.Shield /></span>
                      <span className="qText">{item.q}</span>
                    </div>
                    {isOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                  </button>

                  {isOpen && <div className="aWrap">{item.a}</div>}
                </div>
              );
            })}
          </section>

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
                <Link className="footerLink" to="/blogs">Blog</Link>
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
