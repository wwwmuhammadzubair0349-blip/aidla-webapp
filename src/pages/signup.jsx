import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referCode, setReferCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

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
      marginTop: "8px",
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
    btnDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
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
    loginLink: {
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
    termsLink: {
      color: "#667eea",
      fontWeight: "600",
      textDecoration: "underline",
      cursor: "pointer",
    },
  };

  // Auto-fill refer code from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (ref) setReferCode(ref);
  }, [location.search]);

  // Welcome message when name is entered
  useEffect(() => {
    if (fullName.trim().length >= 2) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [fullName]);

  // Check if email exists
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

  // Password match checker
  useEffect(() => {
    if (!confirmPassword) {
      setPasswordMatch(null);
      return;
    }
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const validate = () => {
    if (fullName.trim().length < 2) return "Please enter your full name.";
    if (!email.trim().includes("@")) return "Please enter a valid email address.";
    if (emailExists) return "This email is already registered. Please login instead.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!agreeToTerms) return "Please agree to the terms and conditions.";
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMsg("");

    const vErr = validate();
    if (vErr) {
      setErrorMsg(vErr);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            refer_code: referCode.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      setStatusMsg(
        "✅ Signup successful! Please check your email for confirmation. After confirming, you can login."
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrorMsg(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
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
        
        .password-toggle:hover {
          background: rgba(102, 126, 234, 0.1);
        }
        
        .link:hover {
          text-decoration: underline;
        }
        
        .terms-link:hover {
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

          {/* Welcome Message */}
          {showWelcome && (
            <div style={styles.welcomeBox}>
              <p style={styles.welcomeText}>
                👋 Welcome, {fullName.trim().split(" ")[0]}! Let's get started
              </p>
            </div>
          )}

          <h2 style={styles.title}>Create Your Account</h2>
          <p style={styles.subtitle}>Join our AI-powered learning community</p>

          <form onSubmit={handleSignup}>
            {/* Full Name */}
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <input
                style={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(emailExists ? styles.inputError : {}),
                  ...(email.includes("@") && !emailExists && !checkingEmail ? styles.inputSuccess : {}),
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <span style={styles.emailStatus}>
                {checkingEmail && "⏳"}
                {!checkingEmail && emailExists && "❌"}
                {!checkingEmail && email.includes("@") && !emailExists && "✅"}
              </span>
            </div>
            {emailExists && (
              <div style={{ ...styles.validationMsg, ...styles.errorText }}>
                ⚠️ This email is already registered
              </div>
            )}

            {/* Refer Code */}
            <label style={styles.label}>Refer Code (optional)</label>
            <div style={styles.inputWrapper}>
              <input
                style={styles.input}
                value={referCode}
                onChange={(e) => setReferCode(e.target.value)}
                placeholder="Enter refer code"
              />
            </div>

            {/* Password */}
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
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

            {/* Confirm Password */}
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(passwordMatch === false ? styles.inputError : {}),
                  ...(passwordMatch === true ? styles.inputSuccess : {}),
                }}
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                autoComplete="new-password"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
            {passwordMatch === false && (
              <div style={{ ...styles.validationMsg, ...styles.errorText }}>
                ⚠️ Passwords do not match
              </div>
            )}

            {/* Terms and Conditions */}
            <div style={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="agreeToTerms" style={styles.checkboxLabel}>
                I agree to the{" "}
                <span 
                  style={styles.termsLink}
                  className="terms-link"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open("/terms", "_blank");
                  }}
                >
                  Terms and Conditions
                </span>
                {" "}and{" "}
                <span 
                  style={styles.termsLink}
                  className="terms-link"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open("/privacy", "_blank");
                  }}
                >
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              style={{
                ...styles.btn,
                ...(loading ? styles.btnDisabled : {}),
              }}
              className="btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {statusMsg && <div style={styles.msgOk}>{statusMsg}</div>}
          {errorMsg && <div style={styles.msgErr}>{errorMsg}</div>}

          <div style={styles.small}>
            📧 After signing up, check your email for confirmation. 
            If you don't see it, check your Spam/Junk folder.
          </div>

          <div style={styles.loginLink}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/login")}>
              Login here
            </span>
          </div>
        </div>
      </div>
    </>
  );
}