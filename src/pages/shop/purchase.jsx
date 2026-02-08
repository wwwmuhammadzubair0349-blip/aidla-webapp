// src/pages/dashboard/Purchase.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const CART_KEY = "aidla_cart_v1";

// --- Icons ---
const Icons = {
  User: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Phone: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Map: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Note: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Lock: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  ArrowLeft: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Check: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Alert: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
};

// --- Reusable Input ---
const FormInput = ({ label, value, onChange, icon, placeholder, required }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
      {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
        {icon}
      </div>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 12px 12px 40px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          outline: "none",
          fontWeight: 600,
          fontSize: "14px",
          color: "#0f172a",
          transition: "border 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "#6366f1"}
        onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
      />
    </div>
  </div>
);

export default function Purchase() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Styling & Responsive
    const style = document.createElement("style");
    style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(style);

    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);

    // Load Cart
    try {
      const c = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      setItems(c);
    } catch { setItems([]); }

    return () => {
      window.removeEventListener("resize", handleResize);
      document.head.removeChild(style);
    };
  }, []);

  const styles = {
    container: {
      width: "100%",
      maxWidth: "1000px",
      margin: "0 auto",
      padding: isMobile ? "16px" : "32px",
      boxSizing: "border-box",
      animation: "fadeIn 0.4s ease-out",
    },
    header: { marginBottom: "24px" },
    title: { margin: 0, fontSize: "28px", fontWeight: 800, color: "#1e293b" },
    subtitle: { margin: "4px 0 0", color: "#64748b", fontWeight: 500, fontSize: "14px" },

    // Layout
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr",
      gap: "24px",
      alignItems: "start",
    },

    // Form Card
    formCard: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
    },
    sectionTitle: { fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" },

    // Summary Card
    summaryCard: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "24px",
      position: isMobile ? "static" : "sticky",
      top: "20px",
    },
    
    // Items List
    itemList: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" },
    itemRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#334155" },
    itemName: { fontWeight: 600, flex: 1, paddingRight: "10px" },
    
    // Totals
    divider: { height: "1px", background: "#e2e8f0", margin: "16px 0" },
    totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "20px", fontWeight: 800, color: "#0f172a" },
    
    // Buttons
    btn: {
      marginTop: "24px",
      width: "100%",
      padding: "14px",
      borderRadius: "12px",
      border: "none",
      background: submitting ? "#94a3b8" : "#0f172a",
      color: "#fff",
      fontWeight: 700,
      fontSize: "16px",
      cursor: submitting ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)",
      transition: "transform 0.1s",
    },
    
    // Alerts
    alert: (type) => ({
      marginTop: "16px",
      padding: "12px 16px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: 600,
      background: type === "error" ? "#fef2f2" : "#ecfeff",
      color: type === "error" ? "#991b1b" : "#155e75",
      border: `1px solid ${type === "error" ? "#fecaca" : "#a5f3fc"}`,
      display: "flex", alignItems: "center", gap: "8px"
    }),

    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      background: "white",
      borderRadius: "16px",
      border: "1px dashed #cbd5e1",
    },
  };

  const submit = async () => {
    setErrorMsg("");
    setStatusMsg("");

    if (!items.length) return setErrorMsg("Cart is empty.");
    if (!fullName.trim()) return setErrorMsg("Full Name is required.");
    if (!phone.trim()) return setErrorMsg("Phone Number is required.");

    setSubmitting(true);
    try {
      const order_details = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      };

      for (const it of items) {
        const { error } = await supabase.rpc("user_create_purchase_request", {
          p_product_id: it.product_id,
          p_quantity: it.quantity,
          p_order_details: order_details,
        });
        if (error) throw error;
      }

      localStorage.removeItem(CART_KEY);
      setStatusMsg("Order placed successfully! Redirecting...");
      setTimeout(() => nav("/shop-history"), 1500);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to submit request.");
      setSubmitting(false);
    }
  };

  const total = items.reduce((s, x) => s + Number(x.price_coins || 0) * Number(x.quantity || 1), 0);

  if (items.length === 0 && !statusMsg) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
           <h2 style={styles.title}>Checkout</h2>
        </div>
        <div style={styles.emptyState}>
          <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>Your cart is empty</h3>
          <p style={{ margin: "0 0 24px 0", color: "#64748b" }}>Add some items from the shop first.</p>
          <button style={{...styles.btn, width: "auto", display: "inline-flex"}} onClick={() => nav("/shop")}>
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          onClick={() => nav("/cart")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}
        >
          <Icons.ArrowLeft /> Back to Cart
        </button>
        <h2 style={styles.title}>Secure Checkout</h2>
        <p style={styles.subtitle}>Complete your purchase request</p>
      </div>

      <div style={styles.grid}>
        
        {/* Left: Form */}
        <div style={styles.formCard}>
          <div style={styles.sectionTitle}>Contact Information</div>
          
          <FormInput 
            label="Full Name" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            icon={<Icons.User />} 
            placeholder="John Doe"
            required
          />
          
          <FormInput 
            label="Phone Number" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            icon={<Icons.Phone />} 
            placeholder="+971 50 123 4567"
            required
          />

          <div style={{ marginTop: "32px", marginBottom: "20px" }} />
          <div style={styles.sectionTitle}>Delivery Details</div>

          <FormInput 
            label="Shipping Address" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            icon={<Icons.Map />} 
            placeholder="Street, Building, Apartment (Optional for digital items)"
          />

          <FormInput 
            label="Order Notes" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            icon={<Icons.Note />} 
            placeholder="Recharge Number / Email / Instructions"
          />

          {errorMsg && <div style={styles.alert("error")}><Icons.Alert /> {errorMsg}</div>}
        </div>

        {/* Right: Summary */}
        <div style={styles.summaryCard}>
          <div style={{...styles.sectionTitle, borderBottom: "none", marginBottom: "16px"}}>Order Summary</div>
          
          <div style={styles.itemList}>
            {items.map((x) => (
              <div key={x.product_id} style={styles.itemRow}>
                <span style={styles.itemName}>
                  {x.quantity} × {x.name}
                </span>
                <span style={{ fontWeight: 700 }}>{(Number(x.price_coins) * Number(x.quantity)).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div style={styles.divider} />
          
          <div style={styles.totalRow}>
            <span>Total</span>
            <span>{total.toLocaleString()} <span style={{fontSize: "14px", fontWeight: 500, color: "#64748b"}}>AIDLA</span></span>
          </div>

          <button 
            style={styles.btn} 
            onClick={submit} 
            disabled={submitting}
            onMouseDown={(e) => !submitting && (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => !submitting && (e.currentTarget.style.transform = "scale(1)")}
          >
            {submitting ? "Processing..." : <><Icons.Lock /> Confirm Order</>}
          </button>

          {statusMsg && <div style={styles.alert("success")}><Icons.Check /> {statusMsg}</div>}
          
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>
            Coins will be deducted upon admin approval. 
          </div>
        </div>

      </div>
    </div>
  );
}