// src/pages/dashboard/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// --- Icons (Embedded SVGs for zero dependencies) ---
const Icons = {
  Edit: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Save: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Camera: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Upload: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
};

// --- Reusable Components ---

const InputField = ({ label, value, onChange, disabled, placeholder, type = "text", fullWidth = false }) => (
  <div style={{ minWidth: 0, gridColumn: fullWidth ? "1 / -1" : "auto" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.02em" }}>
      {label}
    </label>
    <input
      type={type}
      value={value || ""} // Handle null
      disabled={disabled}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "10px 14px",
        borderRadius: "8px",
        border: disabled ? "1px solid #e2e8f0" : "1px solid #cbd5e1",
        backgroundColor: disabled ? "#f8fafc" : "#ffffff",
        color: disabled ? "#64748b" : "#0f172a",
        fontSize: "14px",
        fontWeight: 500,
        outline: "none",
        transition: "all 0.2s ease",
        cursor: disabled ? "default" : "text",
        boxShadow: disabled ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
      }}
      onFocus={(e) => !disabled && (e.target.style.borderColor = "#6366f1", e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)")}
      onBlur={(e) => !disabled && (e.target.style.borderColor = "#cbd5e1", e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)")}
    />
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" }}>
    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>{title}</h3>
    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>{subtitle}</p>
  </div>
);

const Skeleton = ({ width, height, style }) => (
  <div
    style={{
      width,
      height,
      backgroundColor: "#e2e8f0",
      borderRadius: "6px",
      animation: "pulse 1.5s infinite ease-in-out",
      ...style,
    }}
  />
);

export default function Profile() {
  // --- State ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null); // original
  const [form, setForm] = useState(null); // mutable
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isNarrow, setIsNarrow] = useState(false);

  // Bucket Name
  const PROFILE_BUCKET = "profile-pictures";

  // --- Effects ---
  useEffect(() => {
    // Pulse animation style injection
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      .avatar-overlay:hover { opacity: 1 !important; }
    `;
    document.head.appendChild(styleSheet);

    const mq = window.matchMedia("(max-width: 900px)");
    const onChange = () => setIsNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      document.head.removeChild(styleSheet);
    };
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      setErrorMsg(authErr?.message || "Not logged in.");
      setLoading(false);
      return;
    }

    const user = authData.user;
    setUserEmail(user.email || "");

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      setErrorMsg(error.message);
    } else {
      const normalized = {
        full_name: data.full_name || "",
        phone_number: data.phone_number || "",
        whatsapp_number: data.whatsapp_number || "",
        profile_image_url: data.profile_image_url || "",
        country: data.country || "",
        city: data.city || "",
        street_address: data.street_address || "",
        institute_name: data.institute_name || "",
        education_level: data.education_level || "",
        profession_title: data.profession_title || "",
        aidla_coins: data.aidla_coins ?? 0,
        refer_code: data.refer_code || "",
      };
      setProfile(normalized);
      setForm(normalized);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // --- Handlers ---
  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onEdit = () => {
    setErrorMsg("");
    setStatusMsg("");
    setIsEdit(true);
  };

  const onCancel = () => {
    setErrorMsg("");
    setStatusMsg("");
    setForm(profile);
    setIsEdit(false);
  };

  const onSave = async () => {
    setSaving(true);
    setErrorMsg("");
    setStatusMsg("");

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error("Not logged in.");

      if (form.full_name.trim().length < 2) {
        throw new Error("Full name must be at least 2 characters.");
      }

      const updates = {
        full_name: form.full_name.trim(),
        phone_number: form.phone_number.trim() || null,
        whatsapp_number: form.whatsapp_number.trim() || null,
        profile_image_url: form.profile_image_url || null,
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        street_address: form.street_address.trim() || null,
        institute_name: form.institute_name.trim() || null,
        education_level: form.education_level.trim() || null,
        profession_title: form.profession_title.trim() || null,
      };

      const { error } = await supabase.from("user_profiles").update(updates).eq("user_id", authData.user.id);
      if (error) throw error;

      setProfile({ ...profile, ...updates });
      setStatusMsg("Profile saved successfully");
      setIsEdit(false);
    } catch (e) {
      setErrorMsg(e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const onPickImage = async (file) => {
    if (!file) return;
    setErrorMsg("");
    setStatusMsg("");
    setUploading(true);

    try {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error("Not logged in.");

      if (file.size > 3 * 1024 * 1024) throw new Error("Max size is 3MB.");

      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${authData.user.id}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage.from(PROFILE_BUCKET).upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(filePath);
      const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;

      setField("profile_image_url", publicUrl);

      // Auto-save image URL
      await supabase.from("user_profiles").update({ profile_image_url: publicUrl }).eq("user_id", authData.user.id);
      
      setStatusMsg("Profile picture updated");
    } catch (e) {
      setErrorMsg(e.message || "Upload failed.");
      setPreviewUrl(""); // revert preview
    } finally {
      setUploading(false);
    }
  };

  // --- Styles ---
  const styles = {
    page: {
      width: "100%",
      minHeight: "100vh",
      padding: isNarrow ? "20px 16px" : "32px",
      boxSizing: "border-box",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "#f8fafc", // fallback
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.1) 0px, transparent 50%)
      `,
      backgroundAttachment: "fixed",
    },
    container: {
      maxWidth: "1100px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    // Top Header
    headerCard: {
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(12px)",
      borderRadius: "16px",
      padding: "20px 24px",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
    },
    titleGroup: { display: "flex", flexDirection: "column", gap: "4px" },
    pageTitle: { margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em" },
    pageSubtitle: { margin: 0, fontSize: "14px", fontWeight: 500, color: "#64748b" },

    buttonGroup: { display: "flex", gap: "10px" },
    btnPrimary: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      borderRadius: "8px",
      background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
      color: "white",
      fontWeight: 600,
      fontSize: "14px",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
      transition: "transform 0.1s ease, box-shadow 0.1s ease",
    },
    btnSecondary: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      borderRadius: "8px",
      background: "white",
      color: "#334155",
      fontWeight: 600,
      fontSize: "14px",
      border: "1px solid #cbd5e1",
      cursor: "pointer",
      transition: "all 0.1s ease",
    },

    // Layout
    grid: {
      display: "grid",
      gridTemplateColumns: isNarrow ? "1fr" : "340px 1fr",
      gap: "24px",
      alignItems: "start",
    },

    // Left Card (Profile + Stats)
    profileCard: {
      background: "white",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.03)",
      overflow: "hidden",
    },
    coverArea: {
      height: "100px",
      background: "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
      position: "relative",
    },
    avatarWrapper: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      border: "4px solid white",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      background: "#fff",
      margin: "-50px auto 12px",
      position: "relative",
      overflow: "hidden",
      cursor: isEdit ? "pointer" : "default",
    },
    avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
    avatarOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      opacity: 0,
      transition: "opacity 0.2s ease",
    },
    infoBlock: { textAlign: "center", padding: "0 20px 24px" },
    name: { margin: "0 0 4px", fontSize: "18px", fontWeight: 700, color: "#1e293b" },
    email: { margin: 0, fontSize: "13px", color: "#64748b" },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      borderTop: "1px solid #f1f5f9",
    },
    statItem: {
      padding: "16px",
      textAlign: "center",
      borderRight: "1px solid #f1f5f9",
    },
    statVal: { display: "block", fontSize: "18px", fontWeight: 700, color: "#3b82f6" },
    statLabel: { fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" },

    // Right Card (Form)
    formCard: {
      background: "white",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.03)",
      padding: "24px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: isNarrow ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },

    // Alerts
    alert: (type) => ({
      padding: "12px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 500,
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      color: type === "error" ? "#991b1b" : "#166534",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
    }),
  };

  // --- Rendering ---
  
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.headerCard}>
            <div style={styles.titleGroup}>
              <Skeleton width="150px" height="32px" />
              <Skeleton width="220px" height="16px" style={{ marginTop: 6 }} />
            </div>
          </div>
          <div style={styles.grid}>
             {/* Skeleton Profile Card */}
            <div style={{ ...styles.profileCard, padding: 20 }}>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <Skeleton width="100px" height="100px" style={{ borderRadius: '50%', marginBottom: 16 }} />
                 <Skeleton width="180px" height="24px" style={{ marginBottom: 8 }} />
                 <Skeleton width="140px" height="16px" />
               </div>
            </div>
            {/* Skeleton Form */}
            <div style={styles.formCard}>
              <Skeleton width="100%" height="40px" style={{ marginBottom: 24 }} />
              <div style={styles.formGrid}>
                <Skeleton width="100%" height="60px" />
                <Skeleton width="100%" height="60px" />
                <Skeleton width="100%" height="60px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        {/* Header Actions */}
        <div style={styles.headerCard}>
          <div style={styles.titleGroup}>
            <h1 style={styles.pageTitle}>Profile Settings</h1>
            <p style={styles.pageSubtitle}>Manage your personal information and preferences</p>
          </div>
          <div style={styles.buttonGroup}>
            {isEdit ? (
              <>
                <button
                  style={styles.btnSecondary}
                  onClick={onCancel}
                  disabled={saving}
                >
                  <Icons.X /> Cancel
                </button>
                <button
                  style={styles.btnPrimary}
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : <><Icons.Save /> Save Changes</>}
                </button>
              </>
            ) : (
              <button
                style={styles.btnPrimary}
                onClick={onEdit}
              >
                <Icons.Edit /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.grid}>
          
          {/* Left Column: Avatar & Stats */}
          <div style={styles.profileCard}>
            <div style={styles.coverArea} />
            <div style={{ position: "relative", textAlign: "center" }}>
              <div style={styles.avatarWrapper}>
                <img
                  src={previewUrl || form.profile_image_url || "https://ui-avatars.com/api/?name=" + (form.full_name || "User") + "&background=random"}
                  alt="Avatar"
                  style={styles.avatarImg}
                />
                {isEdit && (
                  <label
                    className="avatar-overlay"
                    style={styles.avatarOverlay}
                    title="Change Photo"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => onPickImage(e.target.files[0])}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <span style={{ fontSize: "10px" }}>Uploading...</span>
                    ) : (
                      <Icons.Camera />
                    )}
                  </label>
                )}
              </div>
              <div style={styles.infoBlock}>
                <h2 style={styles.name}>{form.full_name || "Guest User"}</h2>
                <p style={styles.email}>{userEmail}</p>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <span style={styles.statVal}>{form.aidla_coins ?? 0}</span>
                <span style={styles.statLabel}>Coins</span>
              </div>
              <div style={{ ...styles.statItem, borderRight: "none" }}>
                <span style={styles.statVal} title={form.refer_code}>{form.refer_code || "—"}</span>
                <span style={styles.statLabel}>Referral</span>
              </div>
            </div>
            
            {/* Mobile Upload Button fallback if overlay isn't obvious */}
            {isEdit && isNarrow && (
               <div style={{ padding: "0 16px 16px" }}>
                 <label style={{ ...styles.btnSecondary, justifyContent: "center", width: "100%", boxSizing: "border-box" }}>
                    <input type="file" style={{ display: "none" }} onChange={(e) => onPickImage(e.target.files[0])} />
                    <Icons.Upload /> Upload Photo
                 </label>
               </div>
            )}
          </div>

          {/* Right Column: Form */}
          <div style={styles.formCard}>
            
            {/* Feedback Messages */}
            {errorMsg && (
              <div style={styles.alert("error")}>
                ⚠️ {errorMsg}
              </div>
            )}
            {statusMsg && (
              <div style={styles.alert("success")}>
                ✅ {statusMsg}
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()}>
              <SectionHeader title="Account Information" subtitle="Basic details about you" />
              <div style={styles.formGrid}>
                <InputField
                  label="Full Name"
                  value={form.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  disabled={!isEdit}
                  placeholder="e.g. John Doe"
                  fullWidth={true}
                />
                <InputField
                  label="Email Address"
                  value={userEmail}
                  disabled={true}
                />
                <InputField
                  label="Referral Code"
                  value={form.refer_code}
                  disabled={true}
                />
              </div>

              <SectionHeader title="Contact Details" subtitle="How we can reach you" />
              <div style={styles.formGrid}>
                <InputField
                  label="Phone Number"
                  value={form.phone_number}
                  onChange={(e) => setField("phone_number", e.target.value)}
                  disabled={!isEdit}
                  placeholder="+971 50 123 4567"
                />
                <InputField
                  label="WhatsApp"
                  value={form.whatsapp_number}
                  onChange={(e) => setField("whatsapp_number", e.target.value)}
                  disabled={!isEdit}
                  placeholder="+971 50 123 4567"
                />
              </div>

              <SectionHeader title="Location" subtitle="Shipping and billing" />
              <div style={styles.formGrid}>
                <InputField
                  label="Country"
                  value={form.country}
                  onChange={(e) => setField("country", e.target.value)}
                  disabled={!isEdit}
                  placeholder="e.g. UAE"
                />
                <InputField
                  label="City"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  disabled={!isEdit}
                  placeholder="e.g. Dubai"
                />
                <InputField
                  label="Street Address"
                  value={form.street_address}
                  onChange={(e) => setField("street_address", e.target.value)}
                  disabled={!isEdit}
                  placeholder="Building, Street, Unit No."
                  fullWidth={true}
                />
              </div>

              <SectionHeader title="Professional" subtitle="Education and work" />
              <div style={styles.formGrid}>
                <InputField
                  label="Profession / Title"
                  value={form.profession_title}
                  onChange={(e) => setField("profession_title", e.target.value)}
                  disabled={!isEdit}
                  placeholder="e.g. Software Engineer"
                />
                <InputField
                  label="Institute Name"
                  value={form.institute_name}
                  onChange={(e) => setField("institute_name", e.target.value)}
                  disabled={!isEdit}
                  placeholder="e.g. University of Dubai"
                />
                <InputField
                  label="Education Level"
                  value={form.education_level}
                  onChange={(e) => setField("education_level", e.target.value)}
                  disabled={!isEdit}
                  placeholder="e.g. Bachelor's Degree"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}