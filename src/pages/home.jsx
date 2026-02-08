import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.jpg";

// --- HEAD COMPONENT ---
const Head = () => {
  useEffect(() => {
    document.title = "AIDLA | The AI-First Learning Ecosystem";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Master new skills with AI-driven paths and earn tangible rewards. The modern way to learn, mine, and grow.";
    return () => { document.title = "AIDLA"; };
  }, []);
  return null;
};

// --- ICONS ---
const Icons = {
  ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
  Play: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  Trophy: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Coins: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>,
  Server: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
  UserPlus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  ChevronDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
  ChevronUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
};

// --- MAIN COMPONENT ---
export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAllRewards, setShowAllRewards] = useState(false);
  
  // State for database content
  const [hero, setHero] = useState(null);
  const [stats, setStats] = useState([]);
  const [features, setFeatures] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      // Fetch hero content
      const { data: heroData } = await supabase.from('home_hero').select('*').eq('is_active', true).single();
      if (heroData) setHero(heroData);

      // Fetch stats
      const { data: statsData } = await supabase.from('home_stats').select('*').eq('is_active', true).order('order_index');
      if (statsData) setStats(statsData);

      // Fetch features
      const { data: featuresData } = await supabase.from('home_features').select('*').eq('is_active', true).order('order_index');
      if (featuresData) setFeatures(featuresData);

      // Fetch rewards (Increased limit to allow showing more on click)
      const { data: rewardsData } = await supabase
        .from('home_rewards')
        .select('*')
        .eq('is_active', true)
        .order('order_index')
        .limit(12); 
      if (rewardsData) setRewards(rewardsData);

      // Fetch testimonials
      const { data: testimonialsData } = await supabase.from('home_testimonials').select('*').eq('is_active', true).eq('is_featured', true).order('order_index').limit(3);
      if (testimonialsData) setTestimonials(testimonialsData);

      // Fetch upcoming tests
      const { data: testsData } = await supabase.from('home_tests').select('*').eq('is_active', true).gte('test_date', new Date().toISOString()).order('test_date').limit(2);
      if (testsData) setUpcomingTests(testsData);

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading Ecosystem...</p>
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
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-glow: 0 0 25px rgba(79, 70, 229, 0.15);
          --radius-md: 12px;
          --radius-lg: 20px;
          --radius-xl: 24px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        html, body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--white);
          color: var(--dark);
          overflow-x: hidden; /* Prevent horizontal scroll */
          scroll-behavior: smooth;
        }

        /* --- Animations --- */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }

        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        
        .blob-anim { animation: blob 10s infinite alternate; }

        /* --- Layout --- */
        .container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 768px) { .container { padding: 0 20px; } }

        .section { padding: 100px 0; position: relative; }
        @media (max-width: 768px) { .section { padding: 70px 0; } }

        .bg-slate { background-color: #f8fafc; }

        /* --- Components --- */
        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 28px; border-radius: 100px; font-weight: 600; font-size: 1rem;
          cursor: pointer; transition: all 0.2s ease; border: none; text-decoration: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%);
          color: white; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.5); }
        
        .btn-secondary {
          background: white; color: var(--dark); border: 1px solid var(--border);
        }
        .btn-secondary:hover { background: var(--light-gray); border-color: var(--gray); }

        .btn-white { background: white; color: var(--primary); }
        .btn-white:hover { background: var(--light-gray); }

        .btn-outline {
          background: transparent; border: 2px solid rgba(255,255,255,0.3); color: white;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: white; }

        /* --- Professional Cards --- */
        .card {
          background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 32px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative; overflow: hidden; height: 100%; display: flex; flex-direction: column;
        }
        .card:hover {
          transform: translateY(-5px); box-shadow: var(--shadow-lg);
          border-color: rgba(79, 70, 229, 0.3);
        }
        /* Card Shine Effect */
        .card::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-25deg); transition: 0.5s;
        }
        .card:hover::after { left: 150%; transition: 0.7s; }

        .card-dark {
          background: #1e293b; color: white; border: 1px solid rgba(255,255,255,0.1);
        }
        .card-dark:hover { border-color: rgba(255,255,255,0.3); }

        .badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px;
          border-radius: 100px; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.02em;
        }

        /* --- Navbar --- */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          transition: all 0.3s ease; border-bottom: 1px solid transparent;
        }
        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border); padding-top: 12px; padding-bottom: 12px;
          box-shadow: var(--shadow-sm);
        }
        .nav-container { display: flex; justify-content: space-between; align-items: center; height: 80px; }
        .navbar.scrolled .nav-container { height: 64px; }

        .nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; z-index: 1001; }
        .logo-text { font-weight: 800; font-size: 1.5rem; color: var(--dark); letter-spacing: -0.03em; }

        .nav-desktop { display: flex; gap: 32px; align-items: center; }
        .nav-link { text-decoration: none; color: var(--gray); font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
        .nav-link:hover { color: var(--primary); }

        .mobile-toggle { display: none; background: none; border: none; cursor: pointer; color: var(--dark); z-index: 1002; padding: 8px; }

        /* --- Mobile Dropdown Drawer --- */
        .nav-drawer {
          position: absolute; top: 100%; left: 0; width: 100%;
          background: white; border-top: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          padding: 0 0 40px 0; /* Extra bottom padding for safe area */
          transform-origin: top;
          transform: scaleY(0);
          opacity: 0;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          z-index: 999;
          overflow: hidden;
        }
        .nav-drawer.open { transform: scaleY(1); opacity: 1; }
        
        .nav-drawer-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--border); /* Gap creates borders */
        }
        .nav-drawer-item {
          background: white; padding: 20px; text-align: center;
          text-decoration: none; color: var(--dark); font-weight: 600;
          transition: background 0.2s;
        }
        .nav-drawer-item:active { background: var(--light-gray); }
        
        .mobile-actions {
          padding: 24px 20px; display: flex; flex-direction: column; gap: 12px;
          padding-bottom: max(24px, env(safe-area-inset-bottom));
        }

        /* --- Hero --- */
        .hero { position: relative; padding-top: 140px; padding-bottom: 80px; overflow: hidden; }
        .hero-blob {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; z-index: -1;
        }
        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800; line-height: 1.1;
          letter-spacing: -0.03em; margin-bottom: 24px; color: var(--dark);
        }
        .hero-subtitle {
          font-size: 1.25rem; color: var(--gray); line-height: 1.6; max-width: 650px;
          margin: 0 auto 40px;
        }
        .hero-stats {
          display: inline-flex; gap: 40px; background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px); padding: 24px 40px; border-radius: 24px;
          border: 1px solid var(--border); box-shadow: var(--shadow-md); margin-top: 60px;
        }

        /* --- Grid --- */
        .grid-3 {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;
        }
        
        /* --- Feature Icon Box --- */
        .icon-box {
          width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px; font-size: 1.5rem;
        }

        /* --- Loading --- */
        .loading-container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--white); }
        .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        .loading-text { color: var(--gray); margin-top: 16px; font-weight: 500; }

        /* --- Mobile Responsive --- */
        @media (max-width: 768px) {
          .nav-desktop { display: none; }
          .mobile-toggle { display: block; }
          .hero-stats { flex-direction: column; gap: 24px; width: 100%; text-align: center; padding: 20px; }
          .hero { padding-top: 100px; }
          .grid-3 { grid-template-columns: 1fr; }
          .section { padding: 60px 0; }
        }
      `}</style>

      <Head />

      {/* --- NAVBAR --- */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <div className="nav-logo" onClick={() => navigate('/')}>
            <img src={logo} alt="AIDLA" style={{ height: '36px', width: '36px', borderRadius: '8px', objectFit: 'contain' }} />
            <span className="logo-text">AIDLA</span>
          </div>

          {/* Desktop Nav */}
          <div className="nav-desktop">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/blogs" className="nav-link">Blogs</Link>
            <Link to="/faqs" className="nav-link">FAQs</Link>
          </div>

          {/* Desktop Actions */}
          <div className="nav-desktop">
            <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '10px 24px' }}>Login</button>
            <button onClick={() => navigate('/signup')} className="btn btn-primary" style={{ padding: '10px 24px' }}>Signup</button>
          </div>

          {/* Mobile Toggle */}
          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <Icons.ChevronUp /> : <Icons.Menu />}
          </button>
        </div>

        {/* Mobile Drawer (Expandable Header Area) */}
        <div className={`nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-drawer-grid">
            <Link to="/" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            <Link to="/blogs" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Blogs</Link>
            <Link to="/faqs" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>FAQs</Link>
            <Link to="/news" className="nav-drawer-item" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
          </div>
          <div className="mobile-actions">
            <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="btn btn-secondary" style={{ width: '100%' }}>Login</button>
            <button onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }} className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
          </div>
        </div>
      </nav>

      <div>
        {/* --- HERO SECTION --- */}
        <section className="hero">
          {/* Background Blobs */}
          <div className="hero-blob blob-anim" style={{ background: '#e0e7ff', width: '600px', height: '600px', top: '-10%', left: '-10%' }} />
          <div className="hero-blob blob-anim" style={{ background: '#f3e8ff', width: '500px', height: '500px', bottom: '0%', right: '-5%', animationDelay: '2s' }} />

          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
            <div className="animate-fade-in">
              <span className="badge" style={{ background: '#e0e7ff', color: 'var(--primary)', marginBottom: '24px' }}>
                ✨ AI-Powered Learning Ecosystem
              </span>
            </div>

            <h1 className="hero-title animate-fade-in delay-1">
              Learn Smart.<br />
              <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Earn Smarter.
              </span>
            </h1>

            <p className="hero-subtitle animate-fade-in delay-2">
              {hero?.subheadline || "Transform knowledge into currency. Master skills, mine coins, and earn real-world rewards in a gamified environment."}
            </p>

            <div className="animate-fade-in delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate(hero?.primary_button_url || '/signup')} className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                Start Earning Free <Icons.ChevronRight />
              </button>
              <button onClick={() => navigate(hero?.secondary_button_url || '/demo')} className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                <Icons.Play /> Watch Demo
              </button>
            </div>

            {stats.length > 0 && (
              <div className="hero-stats animate-fade-in delay-3">
                {stats.map((stat) => (
                  <div key={stat.id}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark)' }}>{stat.icon} {formatNumber(stat.value)}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gray)', fontWeight: 500 }}>{stat.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        {features.length > 0 && (
          <section className="section bg-slate">
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'var(--dark)' }}>Why AIDLA?</h2>
                <p style={{ color: 'var(--gray)', fontSize: '1.1rem' }}>The first ecosystem designed to turn your screen time into asset building.</p>
              </div>

              <div className="grid-3">
                {features.map((feature) => (
                  <div key={feature.id} className="card">
                    <div className="icon-box" style={{ background: feature.bg_color || 'rgba(79, 70, 229, 0.1)', color: feature.icon_color || 'var(--primary)' }}>
                      {feature.icon}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: 'var(--dark)' }}>{feature.title}</h3>
                    <p style={{ color: 'var(--gray)', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>{feature.description}</p>
                    {feature.link_url && (
                      <Link to={feature.link_url} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        Learn More <Icons.ChevronRight />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- EARNING STRATEGIES SECTION --- */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <span className="badge" style={{ background: '#f1f5f9', color: 'var(--dark)', marginBottom: '16px' }}>💰 Earning Engine</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'var(--dark)' }}>Multiply Your Earnings</h2>
              <p style={{ color: 'var(--gray)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Learning is just the beginning. Maximize your coin balance with our passive income generators.</p>
            </div>

            <div className="grid-3">
              <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                <div className="icon-box" style={{ background: '#e0e7ff', color: 'var(--primary)' }}><Icons.Server /></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>AIDLA Mining</h3>
                <p style={{ color: 'var(--gray)', lineHeight: 1.6, marginBottom: '24px' }}>Don't just learn; earn. Activate AIDLA Miner to utilize your device's idle processing power. Generate coins passively.</p>
                <button className="btn btn-secondary" style={{ width: '100%', borderRadius: '8px', marginTop: 'auto' }}>Start Mining</button>
              </div>

              <div className="card" style={{ borderTop: '4px solid #db2777' }}>
                <div className="icon-box" style={{ background: '#fce7f3', color: '#db2777' }}><Icons.UserPlus /></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Invite Friends</h3>
                <p style={{ color: 'var(--gray)', lineHeight: 1.6, marginBottom: '24px' }}>Get 10% of the coins earned by every friend you invite. Build a network that pays you back.</p>
                <button className="btn btn-secondary" style={{ width: '100%', borderRadius: '8px', marginTop: 'auto' }}>Copy Invite Link</button>
              </div>

              <div className="card" style={{ borderTop: '4px solid #65a30d' }}>
                <div className="icon-box" style={{ background: '#ecfccb', color: '#65a30d' }}><Icons.Calendar /></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Daily Streaks</h3>
                <p style={{ color: 'var(--gray)', lineHeight: 1.6, marginBottom: '24px' }}>Consistency pays off. Log in daily to maintain your streak multiplier and earn up to 2x coins.</p>
                <button className="btn btn-secondary" style={{ width: '100%', borderRadius: '8px', marginTop: 'auto' }}>Check Streak</button>
              </div>
            </div>
          </div>
        </section>

        {/* --- REWARDS SECTION (Show 3, Expandable) --- */}
        {rewards.length > 0 && (
          <section className="section" style={{ background: 'var(--dark)', color: 'white' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', marginBottom: '16px' }}>🎁 Rewards Store</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Redeem Your Coins</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>Exchange your hard-earned coins for real-world value.</p>
              </div>

              <div className="grid-3" id="rewards-grid">
                {rewards.slice(0, showAllRewards ? rewards.length : 3).map((reward) => (
                  <div key={reward.id} className="card card-dark" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    {reward.image_url && (
                      <img src={reward.image_url} alt={reward.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }} />
                    )}
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{reward.title}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5, flex: 1 }}>{reward.description}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', marginTop: 'auto' }}>
                      <Icons.Coins /> <span style={{ fontWeight: 600 }}>{formatNumber(reward.coins_required)} Coins</span>
                    </div>
                  </div>
                ))}
              </div>

              {rewards.length > 3 && (
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                  <button 
                    onClick={() => setShowAllRewards(!showAllRewards)} 
                    className="btn btn-white" 
                    style={{ borderRadius: '100px', minWidth: '200px' }}
                  >
                    {showAllRewards ? 'Show Less' : `Show All ${rewards.length} Rewards`} {showAllRewards ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- UPCOMING TESTS SECTION --- */}
        {upcomingTests.length > 0 && (
          <section className="section">
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'var(--dark)' }}>Upcoming Competitions</h2>
                <p style={{ color: 'var(--gray)', fontSize: '1.1rem' }}>Compete, climb the leaderboard, and win massive prizes.</p>
              </div>

              <div className="grid-3">
                {upcomingTests.map((test) => (
                  <div key={test.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#d97706' }}><Icons.Trophy /></div>
                      {test.prize_pool_coins > 0 && (
                        <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>{formatNumber(test.prize_pool_coins)} Pool</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>{test.title}</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>{test.description}</p>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <Icons.Calendar /> {formatDate(test.test_date)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', fontSize: '0.9rem' }}>
                        <Icons.Users /> {test.current_participants || 0} Registered
                      </div>
                    </div>
                    <button onClick={() => navigate('/tests')} className="btn btn-primary" style={{ width: '100%', marginTop: '24px', padding: '12px' }}>Register Now</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- TESTIMONIALS SECTION --- */}
        {testimonials.length > 0 && (
          <section className="section bg-slate">
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'var(--dark)' }}>Community Stories</h2>
              </div>

              <div className="grid-3">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="card">
                    <div style={{ color: '#fbbf24', marginBottom: '16px', display: 'flex' }}>
                      {[...Array(testimonial.rating || 5)].map((_, i) => <Icons.Star key={i} />)}
                    </div>
                    <p style={{ color: 'var(--dark)', fontSize: '1rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '24px' }}>"{testimonial.content}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
                      {testimonial.user_image_url ? (
                        <img src={testimonial.user_image_url} alt={testimonial.user_name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginRight: '16px' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, marginRight: '16px' }}>{testimonial.user_name.charAt(0)}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--dark)' }}>{testimonial.user_name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{testimonial.user_role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- CTA SECTION --- */}
        <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)', padding: '100px 20px', textAlign: 'center', color: 'white' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Ready to Start Earning?</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.9 }}>Join the revolution where your education pays you back.</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/signup')} className="btn btn-white" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>Get Started Free</button>
              <button onClick={() => navigate('/contact')} className="btn btn-outline" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>Contact Sales</button>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '80px 0 30px', background: 'var(--white)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '60px' }}>
              <div>
                <div className="nav-logo" style={{ marginBottom: '24px', display: 'inline-flex' }}>
                  <img src={logo} alt="AIDLA" style={{ height: '32px', width: '32px', borderRadius: '6px' }} />
                  <span className="logo-text">AIDLA</span>
                </div>
                <p style={{ color: 'var(--gray)', lineHeight: 1.6, maxWidth: '300px' }}>The AI-first learning ecosystem where knowledge is the ultimate currency.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '24px', color: 'var(--dark)' }}>Platform</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[{t:'Courses',l:'/courses'}, {t:'Competitions',l:'/tests'}, {t:'Rewards Store',l:'/rewards'}, {t:'Leaderboard',l:'/leaderboard'}].map(item => (
                    <Link key={item.t} to={item.l} style={{ color: 'var(--gray)', textDecoration: 'none', transition: 'color 0.2s' }}>{item.t}</Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '24px', color: 'var(--dark)' }}>Company</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[{t:'About Us',l:'/about'}, {t:'Careers',l:'/careers'}, {t:'Blog',l:'/blogs'}, {t:'Contact',l:'/contact'}].map(item => (
                    <Link key={item.t} to={item.l} style={{ color: 'var(--gray)', textDecoration: 'none', transition: 'color 0.2s' }}>{item.t}</Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '24px', color: 'var(--dark)' }}>Legal</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[{t:'Terms of Service',l:'/terms'}, {t:'Privacy Policy',l:'/privacy'}, {t:'Cookie Policy',l:'/cookies'}].map(item => (
                    <Link key={item.t} to={item.l} style={{ color: 'var(--gray)', textDecoration: 'none', transition: 'color 0.2s' }}>{item.t}</Link>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ paddingTop: '32px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--gray)', fontSize: '0.9rem' }}>
              © {new Date().getFullYear()} AIDLA Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}