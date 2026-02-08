import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const ADMIN_EMAIL = "zkafridi317@gmail.com";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Enhanced states
  const [showPassword, setShowPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showFunnyEmoji, setShowFunnyEmoji] = useState("");
  const [buttonFlying, setButtonFlying] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const styles = {
    backButton: {
      position: "fixed",
      top: "24px",
      left: "24px",
      background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
      border: "none",
      borderRadius: "12px",
      width: "48px",
      height: "48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "20px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), inset 0 -2px 4px rgba(0, 0, 0, 0.05)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: 1000,
      textDecoration: "none",
    },
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    backgroundPattern: {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      opacity: 0.03,
      pointerEvents: "none",
      backgroundImage: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 35px,
        rgba(255, 255, 255, 0.1) 35px,
        rgba(255, 255, 255, 0.1) 70px
      )`,
    },
    floatingOrb: {
      position: "absolute",
      borderRadius: "50%",
      background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05))",
      filter: "blur(40px)",
      animation: "float 8s ease-in-out infinite",
      pointerEvents: "none",
    },
    wrap: {
      width: "100%",
      maxWidth: "400px",
      background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
      border: "none",
      borderRadius: "20px",
      padding: "28px 24px",
      boxShadow: `
        0 20px 60px rgba(0, 0, 0, 0.15),
        0 8px 24px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8)
      `,
      position: "relative",
      overflow: "visible",
      zIndex: 10,
      backdropFilter: "blur(10px)",
    },
    brandHeader: {
      textAlign: "center",
      marginBottom: "20px",
      position: "relative",
    },
    logo: {
      width: "56px",
      height: "56px",
      margin: "0 auto 10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
      borderRadius: "16px",
      padding: "10px",
      boxShadow: `
        0 8px 24px rgba(102, 126, 234, 0.2),
        inset 0 -2px 8px rgba(0, 0, 0, 0.05)
      `,
    },
    logoImg: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
    brandName: {
      fontSize: "26px",
      fontWeight: "800",
      color: "#667eea",
      margin: "0 0 4px 0",
      letterSpacing: "-0.5px",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    },
    tagline: {
      fontSize: "12px",
      color: "#64748b",
      fontWeight: "500",
      margin: "0",
    },
    welcomeBox: {
      background: "linear-gradient(145deg, #f0f4ff, #e8edff)",
      border: "none",
      borderRadius: "12px",
      padding: "12px 16px",
      marginBottom: "16px",
      textAlign: "center",
      animation: "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: `
        0 4px 12px rgba(102, 126, 234, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.5)
      `,
    },
    welcomeText: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#667eea",
      margin: "0",
    },
    title: {
      margin: "0 0 4px 0",
      fontSize: "20px",
      fontWeight: "700",
      color: "#1e293b",
      textAlign: "center",
    },
    subtitle: {
      fontSize: "13px",
      color: "#64748b",
      textAlign: "center",
      margin: "0 0 20px 0",
      fontWeight: "400",
    },
    label: {
      display: "block",
      fontWeight: "600",
      margin: "0 0 6px",
      fontSize: "13px",
      color: "#334155",
    },
    inputWrapper: {
      position: "relative",
      marginBottom: "14px",
    },
    input: {
      width: "100%",
      padding: "11px 14px",
      borderRadius: "10px",
      border: "2px solid #e2e8f0",
      outline: "none",
      fontSize: "14px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxSizing: "border-box",
      fontFamily: "inherit",
      background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
      boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.04)",
      color: "#1e293b",
    },
    inputFocus: {
      borderColor: "#667eea",
      background: "#ffffff",
      boxShadow: `
        0 0 0 4px rgba(102, 126, 234, 0.1),
        inset 0 2px 4px rgba(0, 0, 0, 0.04)
      `,
    },
    inputError: {
      borderColor: "#ef4444",
      background: "#fef2f2",
      boxShadow: `
        0 0 0 4px rgba(239, 68, 68, 0.1),
        inset 0 2px 4px rgba(239, 68, 68, 0.05)
      `,
    },
    inputSuccess: {
      borderColor: "#10b981",
      background: "#f0fdf4",
      boxShadow: `
        0 0 0 4px rgba(16, 185, 129, 0.1),
        inset 0 2px 4px rgba(16, 185, 129, 0.05)
      `,
    },
    passwordToggle: {
      position: "absolute",
      right: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      fontSize: "16px",
      cursor: "pointer",
      color: "#64748b",
      padding: "4px",
      transition: "all 0.2s ease",
      borderRadius: "6px",
    },
    emailStatus: {
      position: "absolute",
      right: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "15px",
    },
    validationMsg: {
      fontSize: "12px",
      marginTop: "-8px",
      marginBottom: "14px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    errorText: {
      color: "#ef4444",
    },
    successText: {
      color: "#10b981",
    },
    warningText: {
      color: "#f59e0b",
    },
    checkboxWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    checkbox: {
      width: "16px",
      height: "16px",
      cursor: "pointer",
      accentColor: "#667eea",
      flexShrink: 0,
    },
    checkboxLabel: {
      fontSize: "12px",
      color: "#334155",
      lineHeight: 1.4,
      cursor: "pointer",
      userSelect: "none",
      fontWeight: "500",
    },
    forgotLink: {
      background: 'none',
      border: 'none',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      padding: '4px 8px',
      color: '#667eea',
      transition: "all 0.2s ease",
      borderRadius: "6px",
    },
    btn: {
      marginTop: "16px",
      width: "100%",
      padding: "12px 20px",
      borderRadius: "10px",
      border: "none",
      background: "linear-gradient(145deg, #667eea, #764ba2)",
      color: "#fff",
      fontWeight: "700",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: `
        0 8px 24px rgba(102, 126, 234, 0.35),
        inset 0 -2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `,
      fontFamily: "inherit",
      position: "relative",
      overflow: "hidden",
    },
    btnSecondary: {
      marginTop: "10px",
      width: "100%",
      padding: "11px 20px",
      borderRadius: "10px",
      border: "2px solid #e2e8f0",
      background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
      color: "#667eea",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      fontFamily: "inherit",
      boxShadow: `
        0 4px 12px rgba(0, 0, 0, 0.05),
        inset 0 -2px 4px rgba(0, 0, 0, 0.03)
      `,
    },
    btnDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    btnFlying: {
      position: "relative",
      transition: "all 0.3s ease",
    },
    funnyEmoji: {
      position: "absolute",
      fontSize: "40px",
      animation: "emojiPop 0.6s ease-out",
      pointerEvents: "none",
      zIndex: 1000,
    },
    msgOk: {
      marginTop: "12px",
      padding: "10px 12px",
      borderRadius: "10px",
      background: "linear-gradient(145deg, #f0fdf4, #dcfce7)",
      border: "none",
      color: "#166534",
      fontWeight: "600",
      lineHeight: 1.4,
      fontSize: "12px",
      animation: "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: `
        0 4px 12px rgba(16, 185, 129, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.5)
      `,
    },
    msgErr: {
      marginTop: "12px",
      padding: "10px 12px",
      borderRadius: "10px",
      background: "linear-gradient(145deg, #fef2f2, #fee2e2)",
      border: "none",
      color: "#991b1b",
      fontWeight: "600",
      lineHeight: 1.4,
      fontSize: "12px",
      animation: "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: `
        0 4px 12px rgba(239, 68, 68, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.5)
      `,
    },
    small: {
      marginTop: "12px",
      color: "#64748b",
      fontSize: "11px",
      lineHeight: 1.5,
      textAlign: "center",
      padding: "10px 12px",
      background: "linear-gradient(145deg, #f8fafc, #f1f5f9)",
      borderRadius: "10px",
      boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.04)",
    },
    signupLink: {
      textAlign: "center",
      marginTop: "12px",
      fontSize: "12px",
      color: "#64748b",
      fontWeight: "500",
    },
    link: {
      color: "#667eea",
      fontWeight: "600",
      textDecoration: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    attemptsWarning: {
      fontSize: "11px",
      color: "#f59e0b",
      fontWeight: "600",
      marginTop: "-6px",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "8px 10px",
      background: "linear-gradient(145deg, #fffbeb, #fef3c7)",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(245, 158, 11, 0.1)",
    },
  };

  // Auto-fill email from localStorage if "Remember Me" was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Check if email exists in database
  useEffect(() => {
    const checkEmail = async () => {
      if (!email.trim() || !email.includes("@")) {
        setEmailExists(false);
        setCheckingEmail(false);
        return;
      }

      setCheckingEmail(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking email:', error);
          setEmailExists(false);
        } else if (data) {
          setEmailExists(true);
        } else {
          setEmailExists(false);
        }
      } catch (err) {
        console.error('Error checking email:', err);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timer = setTimeout(checkEmail, 800);
    return () => clearTimeout(timer);
  }, [email]);

  // Show welcome back for recognized emails
  useEffect(() => {
    if (emailExists && email.includes("@")) {
      setShowWelcomeBack(true);
    } else {
      setShowWelcomeBack(false);
    }
  }, [emailExists, email]);

  const validate = () => {
    if (!email.trim().includes("@")) return "Please enter a valid email address.";
    if (!emailExists && email.includes("@")) return "Email not registered. Please sign up first.";
    if (password.length < 6) return "Please Enter Password.";
    if (loginAttempts >= 3) return "Too many failed attempts. Please wait 30 seconds.";
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMsg("");

    const vErr = validate();
    if (vErr) {
      setErrorMsg(vErr);
      setLoginAttempts(prev => prev + 1);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Save email if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setStatusMsg("Login successful ✅ Redirecting...");

      const loggedInEmail = (data?.user?.email || email).toLowerCase();

      setTimeout(() => {
        if (loggedInEmail === ADMIN_EMAIL) {
          navigate("/choose-side");
        } else {
          navigate("/dashboard");
        }
      }, 800);
      
      // Reset login attempts on success
      setLoginAttempts(0);
    } catch (err) {
      setErrorMsg(err?.message || "Login failed. Please check your credentials.");
      setLoginAttempts(prev => prev + 1);
      
      // Fun emoji for failed attempts
      if (loginAttempts >= 2) {
        const emojis = ["😅", "🤔", "🔑", "❓", "👀", "🔍"];
        setShowFunnyEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
        setTimeout(() => setShowFunnyEmoji(""), 800);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg("");
    setStatusMsg("");

    if (!email.trim().includes("@")) {
      setErrorMsg("Enter your email first, then click Reset Password.");
      return;
    }

    if (!emailExists) {
      setErrorMsg("Email not registered. Please sign up instead.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;

      setStatusMsg("📧 Password reset email sent! Check your inbox (and spam folder).");
    } catch (err) {
      setErrorMsg(err?.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  // Fun flying button when conditions not met
  const handleButtonHover = () => {
    if (loginAttempts >= 2) {
      setButtonFlying(true);
      const emojis = ["😅", "🙈", "😬", "🤷‍♂️", "😆", "🫣", "😝", "🤪"];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      setShowFunnyEmoji(randomEmoji);
      
      const newTop = Math.random() * 50 - 25;
      const newLeft = Math.random() * 100 - 50;
      setButtonPosition({ top: newTop, left: newLeft });
      
      setTimeout(() => {
        setButtonFlying(false);
        setButtonPosition({ top: 0, left: 0 });
      }, 300);
      
      setTimeout(() => {
        setShowFunnyEmoji("");
      }, 600);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-20px, -20px);
          }
        }
        
        @keyframes emojiPop {
          0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.5) rotate(20deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateY(-50px) rotate(40deg);
          }
        }
        
        .back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12), inset 0 -2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .back-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        input:focus {
          border-color: #667eea !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.04) !important;
        }
        
        button:not(:disabled):hover {
          transform: translateY(-2px);
        }
        
        button:not(:disabled):active {
          transform: translateY(0);
        }
        
        .btn-primary:hover {
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.45), inset 0 -2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .btn-secondary:hover {
          border-color: #667eea;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15), inset 0 -2px 4px rgba(0, 0, 0, 0.03);
        }
        
        .password-toggle:hover {
          background: rgba(102, 126, 234, 0.1);
        }
        
        .forgot-link:hover {
          background: rgba(102, 126, 234, 0.08);
        }
        
        .link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 12px !important;
          }
          .wrap {
            padding: 20px 18px !important;
            max-width: 360px !important;
          }
          .back-button {
            width: 40px !important;
            height: 40px !important;
            top: 12px !important;
            left: 12px !important;
            font-size: 16px !important;
          }
        }
        
        @media (max-height: 700px) {
          .wrap {
            padding: 20px 18px !important;
          }
        }
      `}</style>
      
      {/* Back to Home Button */}
      <button 
        onClick={() => navigate("/")}
        style={styles.backButton}
        className="back-button"
        title="Back to Home"
      >
        ←
      </button>
      
      <div style={styles.container} className="container">
        {/* Background Pattern */}
        <div style={styles.backgroundPattern}></div>
        
        {/* Floating Orbs for depth */}
        <div style={{ ...styles.floatingOrb, width: '300px', height: '300px', top: '-150px', left: '-150px', animationDelay: '0s' }}></div>
        <div style={{ ...styles.floatingOrb, width: '400px', height: '400px', bottom: '-200px', right: '-200px', animationDelay: '2s' }}></div>

        <div style={styles.wrap}>
          {/* Brand Header */}
          <div style={styles.brandHeader}>
            <div style={styles.logo}>
              <img 
                src="/src/assets/logo.jpg" 
                alt="AIDLA Logo" 
                style={styles.logoImg}
              />
            </div>
            <h1 style={styles.brandName}>AIDLA</h1>
            <p style={styles.tagline}>AI-Driven Learning Academy</p>
          </div>

          {/* Welcome Back Message */}
          {showWelcomeBack && (
            <div style={styles.welcomeBox}>
              <p style={styles.welcomeText}>
                👋 Welcome back! Ready to continue learning?
              </p>
            </div>
          )}

          <h2 style={styles.title}>Login to Your Account</h2>
          <p style={styles.subtitle}>Access your personalized learning dashboard</p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(emailExists && email.includes("@") ? styles.inputSuccess : {}),
                  ...(email.includes("@") && !emailExists ? styles.inputError : {}),
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <span style={styles.emailStatus}>
                {checkingEmail && "⏳"}
                {!checkingEmail && emailExists && email.includes("@") && "✅"}
                {!checkingEmail && email.includes("@") && !emailExists && "❌"}
              </span>
            </div>
            {email.includes("@") && !emailExists && !checkingEmail && (
              <div style={{ ...styles.validationMsg, ...styles.errorText }}>
                ⚠️ Email not registered
              </div>
            )}

            {/* Password */}
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="rememberMe" style={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={styles.forgotLink}
                className="forgot-link"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Attempts Warning */}
            {loginAttempts > 0 && (
              <div style={styles.attemptsWarning}>
                ⚠️ Failed attempts: {loginAttempts}
                {loginAttempts >= 3 && " - Please wait before trying again"}
              </div>
            )}

            {/* Flying Button with Fun Emojis */}
            <div style={{ position: "relative" }}>
              {showFunnyEmoji && (
                <div 
                  style={{
                    ...styles.funnyEmoji,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {showFunnyEmoji}
                </div>
              )}
              <button
                style={{
                  ...styles.btn,
                  ...(loading || loginAttempts >= 3 ? styles.btnDisabled : {}),
                  ...(buttonFlying ? styles.btnFlying : {}),
                  transform: buttonFlying 
                    ? `translate(${buttonPosition.left}px, ${buttonPosition.top}px)` 
                    : "none",
                }}
                className="btn-primary"
                type="submit"
                disabled={loading || loginAttempts >= 3}
                onMouseEnter={handleButtonHover}
              >
                {loading ? "Logging in..." : "Login to Dashboard"}
              </button>
            </div>
          </form>

          {statusMsg && <div style={styles.msgOk}>{statusMsg}</div>}
          {errorMsg && <div style={styles.msgErr}>{errorMsg}</div>}

          <div style={styles.small}>
            💡 Use the same email you signed up with. 
            If you haven't confirmed your email, check your spam folder.
          </div>

          <div style={styles.signupLink}>
            Don't have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/signup")}>
              Sign up here
            </span>
          </div>
        </div>
      </div>
    </>
  );
}