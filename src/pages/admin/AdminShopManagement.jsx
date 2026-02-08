// src/pages/dashboard/adminshopmanagement.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// Reuse existing orders component
import AdminPurchaseRequests from "./adminpurchaserequests";

// --- Icons ---
const Icons = {
  Plus: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
  List: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>,
  Cart: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
  Chart: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  Edit: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  Trash: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  Upload: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>,
  Check: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
};

// --- Form Input ---
const InputField = ({ label, value, onChange, placeholder, type = "text", min, step, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>{label}</label>
    {options ? (
      <select 
        value={value} 
        onChange={onChange}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", fontSize: "14px", fontWeight: 500 }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 500 }}
      />
    )}
  </div>
);

export default function AdminShopManagement() {
  const [tab, setTab] = useState("products"); // products | add | orders | revenue
  
  // --- Products State ---
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [imgUrls, setImgUrls] = useState({});

  // --- Add/Edit Form State ---
  const [editId, setEditId] = useState(null); // null = create mode
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_coins: "",
    quantity: "",
    product_type: "physical", // physical | digital
    offer_type: "none", // none | percent | flat
    offer_value: "0",
    offer_title: "",
    is_active: "true"
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Revenue State ---
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [revenueRows, setRevenueRows] = useState([]);
  
  const styles = {
    container: { width: "100%", animation: "fadeIn 0.4s ease-out" },
    header: { marginBottom: "20px" },
    title: { margin: 0, fontSize: "24px", fontWeight: 800, color: "#1e293b" },
    
    // Tabs
    tabBar: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" },
    tabBtn: (active) => ({
      display: "flex", alignItems: "center", gap: "6px",
      padding: "10px 16px", borderRadius: "10px", border: "none",
      background: active ? "#0f172a" : "white",
      color: active ? "white" : "#64748b",
      fontWeight: 700, fontSize: "13px", cursor: "pointer",
      boxShadow: active ? "0 4px 12px rgba(15,23,42,0.2)" : "0 2px 4px rgba(0,0,0,0.05)",
      transition: "all 0.2s"
    }),

    // Cards
    card: { background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" },
    
    // List Item
    item: { 
      display: "flex", justifyContent: "space-between", alignItems: "center", 
      padding: "16px", borderBottom: "1px solid #f1f5f9", gap: "12px" 
    },
    itemImg: { width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", background: "#f1f5f9" },
    itemMeta: { flex: 1 },
    itemName: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
    itemSub: { fontSize: "12px", color: "#64748b", marginTop: "4px" },
    
    // Badges
    badge: (active) => ({
      padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
      background: active ? "#ecfdf5" : "#fef2f2",
      color: active ? "#059669" : "#dc2626",
    }),

    // Form
    formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" },
    uploadZone: (hasFile) => ({
      border: hasFile ? "2px solid #10b981" : "2px dashed #cbd5e1",
      borderRadius: "12px", padding: "20px", textAlign: "center", cursor: "pointer",
      background: hasFile ? "#ecfdf5" : "#f8fafc",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
    }),

    btn: (primary) => ({
      padding: "12px 20px", borderRadius: "10px", border: "none",
      background: primary ? "#3b82f6" : "#f1f5f9",
      color: primary ? "white" : "#475569",
      fontWeight: 700, fontSize: "14px", cursor: "pointer",
      display: "flex", alignItems: "center", gap: "6px"
    }),

    alert: (type) => ({
      marginBottom: "16px", padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
      background: type === "error" ? "#fef2f2" : "#ecfeff",
      color: type === "error" ? "#991b1b" : "#155e75",
      border: `1px solid ${type === "error" ? "#fecaca" : "#a5f3fc"}`,
    })
  };

  // --- Initial Data Load ---
  const signImage = async (path) => {
    if (!path || imgUrls[path]) return;
    const { data } = await supabase.storage.from("shop_images").createSignedUrl(path, 3600);
    if (data?.signedUrl) setImgUrls(prev => ({ ...prev, [path]: data.signedUrl }));
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase.from("shop_products").select("*").order("id", { ascending: false });
      if (error) throw error;
      setProducts(data || []);
      data?.forEach(p => p.image_path && signImage(p.image_path));
    } catch (e) { setErr(e.message); }
    finally { setLoadingProducts(false); }
  };

  const loadRevenue = async () => {
    setLoadingRevenue(true);
    try {
      const { data, error } = await supabase.from("shop_revenue").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      setRevenueRows(data || []);
    } catch (e) { setErr(e.message); }
    finally { setLoadingRevenue(false); }
  };

  useEffect(() => {
    loadProducts();
    loadRevenue();
  }, []);

  // --- Form Handlers ---
  const handleEdit = (p) => {
    setEditId(p.id);
    setFormData({
      name: p.name,
      description: p.description || "",
      price_coins: p.price_coins,
      quantity: p.quantity,
      product_type: p.product_type,
      offer_type: p.offer_type,
      offer_value: p.offer_value,
      offer_title: p.offer_title || "",
      is_active: p.is_active ? "true" : "false"
    });
    setTab("add");
    setMsg("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const { error } = await supabase.from("shop_products").delete().eq("id", id);
      if (error) throw error;
      loadProducts();
    } catch (e) { alert(e.message); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErr("");
    setMsg("");

    try {
      // 1. Validation
      if (!formData.name || !formData.price_coins || !formData.quantity) throw new Error("Name, Price, and Quantity are required.");

      // 2. Image Upload
      let imagePath = null;
      if (file) {
        const ext = file.name.split('.').pop();
        const path = `products/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("shop_images").upload(path, file);
        if (upErr) throw upErr;
        imagePath = path;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price_coins: Number(formData.price_coins),
        quantity: Number(formData.quantity),
        product_type: formData.product_type,
        offer_type: formData.offer_type,
        offer_value: Number(formData.offer_value),
        offer_title: formData.offer_title,
        is_active: formData.is_active === "true",
        ...(imagePath && { image_path: imagePath }) // Only update image if new one uploaded
      };

      if (editId) {
        // Update
        const { error } = await supabase.from("shop_products").update(payload).eq("id", editId);
        if (error) throw error;
        setMsg("Product updated successfully ✅");
      } else {
        // Create
        const { error } = await supabase.from("shop_products").insert(payload);
        if (error) throw error;
        setMsg("Product created successfully ✅");
      }

      // Reset
      setEditId(null);
      setFormData({
        name: "", description: "", price_coins: "", quantity: "",
        product_type: "physical", offer_type: "none", offer_value: "0",
        offer_title: "", is_active: "true"
      });
      setFile(null);
      loadProducts();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData({
      name: "", description: "", price_coins: "", quantity: "",
      product_type: "physical", offer_type: "none", offer_value: "0",
      offer_title: "", is_active: "true"
    });
    setFile(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Shop Management</h2>
      </div>

      <div style={styles.tabBar}>
        <button style={styles.tabBtn(tab === "products")} onClick={() => setTab("products")}><Icons.List /> Products</button>
        <button style={styles.tabBtn(tab === "add")} onClick={() => setTab("add")}><Icons.Plus /> {editId ? "Edit Product" : "Add Product"}</button>
        <button style={styles.tabBtn(tab === "orders")} onClick={() => setTab("orders")}><Icons.Cart /> Orders</button>
        <button style={styles.tabBtn(tab === "revenue")} onClick={() => setTab("revenue")}><Icons.Chart /> Revenue</button>
      </div>

      {/* --- PRODUCTS TAB --- */}
      {tab === "products" && (
        <div style={styles.card}>
          <div style={{display: "flex", justifyContent: "space-between", marginBottom: 16}}>
            <h3>Product List</h3>
            <button style={{...styles.btn(false), padding: "6px 12px"}} onClick={loadProducts}>Refresh</button>
          </div>
          
          {loadingProducts ? <div>Loading...</div> : products.length === 0 ? <div>No products found.</div> : (
            <div>
              {products.map(p => (
                <div key={p.id} style={styles.item}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <img src={imgUrls[p.image_path] || "https://via.placeholder.com/50"} alt={p.name} style={styles.itemImg} />
                    <div>
                      <div style={styles.itemName}>{p.name}</div>
                      <div style={styles.itemSub}>
                        {Number(p.price_coins).toLocaleString()} Coins • Stock: {p.quantity} • 
                        <span style={{ marginLeft: 6, ...styles.badge(p.is_active) }}>{p.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleEdit(p)} style={{ ...styles.btn(false), padding: "8px" }} title="Edit"><Icons.Edit /></button>
                    <button onClick={() => handleDelete(p.id)} style={{ ...styles.btn(false), padding: "8px", color: "#dc2626" }} title="Delete"><Icons.Trash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- ADD/EDIT TAB --- */}
      {tab === "add" && (
        <div style={styles.card}>
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
            <h3>{editId ? "Edit Product" : "Create New Product"}</h3>
            {editId && <button onClick={cancelEdit} style={styles.btn(false)}>Cancel Edit</button>}
          </div>

          {msg && <div style={styles.alert("success")}>{msg}</div>}
          {err && <div style={styles.alert("error")}>{err}</div>}

          <div style={styles.formGrid}>
            <InputField label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <InputField label="Price (Coins)" type="number" value={formData.price_coins} onChange={e => setFormData({...formData, price_coins: e.target.value})} />
            <InputField label="Stock Quantity" type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            <InputField label="Type" value={formData.product_type} onChange={e => setFormData({...formData, product_type: e.target.value})} options={[{value: "physical", label: "Physical"}, {value: "digital", label: "Digital"}]} />
          </div>

          <div style={styles.formGrid}>
             <InputField label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
             <InputField label="Status" value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value})} options={[{value: "true", label: "Active"}, {value: "false", label: "Inactive"}]} />
          </div>

          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", marginBottom: "20px" }}>
             <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Offer Settings (Optional)</strong>
             <div style={{ ...styles.formGrid, marginTop: "12px", marginBottom: 0 }}>
                <InputField label="Offer Type" value={formData.offer_type} onChange={e => setFormData({...formData, offer_type: e.target.value})} options={[{value: "none", label: "None"}, {value: "percent", label: "Percentage %"}, {value: "flat", label: "Flat Amount"}]} />
                <InputField label="Offer Value" type="number" value={formData.offer_value} onChange={e => setFormData({...formData, offer_value: e.target.value})} />
                <InputField label="Offer Badge Title" value={formData.offer_title} onChange={e => setFormData({...formData, offer_title: e.target.value})} placeholder="e.g. SUMMER SALE" />
             </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 700, color: "#475569" }}>PRODUCT IMAGE</label>
            <label style={styles.uploadZone(!!file)}>
              <input type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} accept="image/*" />
              <div style={{ color: file ? "#10b981" : "#64748b" }}><Icons.Upload /></div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: file ? "#059669" : "#475569" }}>
                {file ? file.name : "Click to Upload Image"}
              </div>
              {editId && !file && <div style={{ fontSize: "11px", color: "#94a3b8" }}>(Leave empty to keep current image)</div>}
            </label>
          </div>

          <button onClick={handleSubmit} disabled={submitting} style={{ ...styles.btn(true), width: "100%", justifyContent: "center" }}>
            {submitting ? "Processing..." : (editId ? "Update Product" : "Create Product")}
          </button>
        </div>
      )}

      {/* --- ORDERS TAB --- */}
      {tab === "orders" && (
        <div style={styles.card}>
          <AdminPurchaseRequests />
        </div>
      )}

      {/* --- REVENUE TAB --- */}
      {tab === "revenue" && (
        <div style={styles.card}>
           <div style={{display: "flex", justifyContent: "space-between", marginBottom: 16}}>
            <h3>Revenue Log</h3>
            <button style={{...styles.btn(false), padding: "6px 12px"}} onClick={loadRevenue}>Refresh</button>
          </div>

          {loadingRevenue ? <div>Loading...</div> : revenueRows.length === 0 ? <div>No revenue recorded yet.</div> : (
            <div>
              {revenueRows.map(r => (
                <div key={r.id} style={styles.item}>
                   <div>
                     <div style={styles.itemName}>Tx: {r.purchase_tx_no}</div>
                     <div style={styles.itemSub}>{new Date(r.created_at).toLocaleString()}</div>
                   </div>
                   <div style={{ textAlign: "right" }}>
                     <div style={{ fontSize: "16px", fontWeight: 800, color: "#059669" }}>+{Number(r.amount_coins).toLocaleString()}</div>
                     <span style={styles.badge(!r.is_reversed)}>{r.is_reversed ? "Reversed" : "Settled"}</span>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}