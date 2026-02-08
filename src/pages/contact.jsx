import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.jpg";

const Icons = {
  Menu: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  ChevronUp: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 15l-6-6-6 6" />
    </svg>
  ),
  Mail: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16v16H4z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function Contact() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showDialog = (title, text) => {
    window.alert(`${title}\n\n${text}`);
  };

  const validate = () => {
    const n = name.trim();
    const eMail = email.trim();
    const msg = message.trim();

    if (n.length < 2) return "Please enter your name (min 2 characters).";
    if (!isValidEmail(eMail)) return "Please enter a valid email address.";
    if (msg.length < 5) return "Message is too short (min 5 characters).";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    console.log("SUBMIT CLICKED", { name, email, message });

    const errMsg = validate();
    if (errMsg) {
      setFormError(errMsg);
      showDialog("⚠️ Fix this first", errMsg);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      };

      const { data, error } = await supabase
        .from("contact_inquiries")
        .insert([payload])
        .select("id")
        .single();

      if (error) throw error;

      setName("");
      setEmail("");
      setMessage("");

      showDialog(
        "✅ Sent Successfully",
        `Your message has been received.\n\nTicket ID: ${data?.id || "N/A"}`
      );
    } catch (err) {
      console.error("Contact insert error:", err);
      const msg =
        err?.message ||
        "Unknown error. Check table name + RLS insert policy + supabase keys.";

      setFormError(msg);
      showDialog("❌ Failed to Send", msg);
    } finally {
      setSubmitting(false);
    }
  };

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
          --danger:#ef4444;
          --danger-bg:#fee2e2;
        }

        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent; min-width:0;}
        html,body{
          font-family:'Plus Jakarta Sans',sans-serif;
          background:#fff;color:var(--dark);
          overflow-x:hidden;
          width:100%;
        }
        img, svg, video, canvas { max-width:100%; height:auto; }

        .container{
          width:100%;
          max-width:1280px;
          margin:0 auto;
          padding:0 24px;
        }
        @media(max-width:768px){
          .container{ padding:0 10px; }
        }

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
        .nav-inner{
          display:flex;align-items:center;justify-content:space-between;gap:10px;
        }
        .nav-logo{
          display:flex;align-items:center;gap:10px;cursor:pointer;text-decoration:none;
        }
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
        .btn:disabled{
          opacity:.7;
          cursor:not-allowed;
        }
        .btn-primary{
          background:linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%);
          color:#fff;box-shadow:0 10px 22px rgba(79,70,229,0.30);
        }
        .btn-secondary{background:#fff;color:var(--dark);border:1px solid var(--border)}
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
        .drawer-grid{
          display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border)
        }
        .drawer-item{
          background:#fff;padding:16px;text-align:center;
          font-weight:950;color:var(--dark);text-decoration:none;
        }
        .drawer-actions{
          padding:14px 10px;display:flex;flex-direction:column;gap:10px;
          padding-bottom:max(14px, env(safe-area-inset-bottom))
        }

        main.page{
          width:100%;
          overflow-x:hidden;
          padding-top:92px;
          padding-bottom:64px;
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
          .hero{padding:30px;border-radius:24px}
        }

        .hero::before{
          content:"";
          position:absolute;
          inset:0;
          background:
            radial-gradient(circle at 18% 20%, rgba(79,70,229,0.18), transparent 55%),
            radial-gradient(circle at 82% 30%, rgba(14,165,233,0.16), transparent 55%);
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

        .card{
          width:100%;
          background:#fff;border:1px solid var(--border);
          border-radius:18px;padding:14px;
          box-shadow:0 10px 18px rgba(15,23,42,0.06);
        }
        @media(min-width:769px){
          .card{border-radius:24px;padding:22px}
        }

        .headerRow{display:flex;align-items:center;gap:10px;margin-bottom:12px}
        .headerIcon{
          width:40px;height:40px;border-radius:14px;
          display:flex;align-items:center;justify-content:center;
          background:rgba(79,70,229,0.10);color:var(--primary);
          flex:0 0 auto;
        }

        .field{display:flex;flex-direction:column;gap:7px;margin-bottom:10px}
        .label{font-weight:950;color:var(--dark);font-size:.93rem}
        .input, .textarea{
          width:100%;
          border:1px solid var(--border);
          border-radius:14px;
          padding:11px 12px;
          outline:none;
          font-weight:800;
          background:#fff;
        }
        .textarea{min-height:110px;resize:vertical}
        .input:focus, .textarea:focus{
          border-color:rgba(79,70,229,0.55);
          box-shadow:0 0 0 4px rgba(79,70,229,0.12);
        }

        .errorBox{
          margin-top:12px;
          background:var(--danger-bg);
          color:#991b1b;
          border:1px solid rgba(239,68,68,0.35);
          border-radius:14px;
          padding:10px 12px;
          font-weight:900;
          font-size:.92rem;
          line-height:1.45;
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
            <img
              src={logo}
              alt="AIDLA"
              style={{ height: 34, width: 34, borderRadius: 10, objectFit: "contain" }}
            />
            <span className="logo-text">AIDLA</span>
          </div>

          <div className="nav-desktop">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link" style={{ color: "var(--primary)" }}>Contact</Link>
            <Link to="/blogs" className="nav-link">Blogs</Link>
            <Link to="/faqs" className="nav-link">FAQs</Link>
          </div>

          <div className="nav-actions">
            <button onClick={() => navigate("/login")} className="btn btn-secondary">Login</button>
            <button onClick={() => navigate("/signup")} className="btn btn-primary">Signup</button>
          </div>

          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <Icons.ChevronUp /> : <Icons.Menu />}
          </button>
        </div>

        <div className={`nav-drawer ${isMobileMenuOpen ? "open" : ""}`}>
          <div className="drawer-grid">
            <Link to="/" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            <Link to="/blogs" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
            <Link to="/faqs" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>FAQs</Link>
            <Link to="/news" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
          </div>

          <div className="drawer-actions">
            <button
              onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
              className="btn btn-secondary"
              style={{ width: "100%" }}
            >
              Login
            </button>
            <button
              onClick={() => { navigate("/signup"); setIsMobileMenuOpen(false); }}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Create Account
            </button>
          </div>
        </div>
      </nav>

      {/* PAGE */}
      <main className="page">
        <div className="container">
          <div className="hero">
            <h1 className="title">Contact AIDLA</h1>
            <p className="subtitle">
              Support, partnerships, or ideas — send a message. We read everything.
            </p>

            <div style={{ marginTop: 14 }}>
              <div className="card">
                <div className="headerRow">
                  <span className="headerIcon"><Icons.Mail /></span>
                  <div>
                    <div style={{ fontWeight: 980, fontSize: "1.06rem", lineHeight: 1.2 }}>
                      Send a Message
                    </div>
                    <div style={{ color: "var(--gray)", fontWeight: 850, fontSize: ".9rem" }}>
                      Support / Sales / Partnerships
                    </div>
                  </div>
                </div>

                <form onSubmit={onSubmit}>
                  <div className="field">
                    <div className="label">Name</div>
                    <input
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      name="name"
                    />
                  </div>

                  <div className="field">
                    <div className="label">Email</div>
                    <input
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      autoComplete="email"
                      inputMode="email"
                      name="email"
                    />
                  </div>

                  <div className="field">
                    <div className="label">Message</div>
                    <textarea
                      className="textarea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      name="message"
                    />
                  </div>

                  {/* ALWAYS CLICKABLE */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "12px 16px" }}
                    disabled={submitting}
                    onClick={() => console.log("BUTTON CLICKED")}
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>

                  {formError ? (
                    <div className="errorBox">{formError}</div>
                  ) : null}

                  <div style={{ marginTop: 10, color: "var(--gray)", fontWeight: 850, fontSize: ".9rem", lineHeight: 1.6 }}>
                    Your message is saved in database and visible to admin.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footerGrid">
            <div>
              <div className="nav-logo" style={{ marginBottom: 12 }}>
                <img src={logo} alt="AIDLA" style={{ height: 32, width: 32, borderRadius: 10 }} />
                <span className="logo-text">AIDLA</span>
              </div>
              <div style={{ color: "var(--gray)", fontWeight: 850, lineHeight: 1.7, maxWidth: 420 }}>
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
              <Link className="footerLink" to="/blogs">Blog</Link>
              <Link className="footerLink" to="/faqs">FAQs</Link>
            </div>
          </div>

          <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--gray)", fontWeight: 900 }}>
            © {new Date().getFullYear()} AIDLA Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
