// src/pages/dashboard/Cart.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CART_KEY = "aidla_cart_v1";

// --- Icons ---
const Icons = {
  Trash: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Minus: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Bag: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

export default function Cart() {
  const nav = useNavigate();
  const summaryRef = useRef(null);

  const [items, setItems] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [mobilePadBottom, setMobilePadBottom] = useState(120);

  const readCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const writeCart = (v) => localStorage.setItem(CART_KEY, JSON.stringify(v));

  // ✅ If you store stock on item as quantity_available, enforce it
  const clampCart = (arr) => {
    const next = (Array.isArray(arr) ? arr : []).map((x) => {
      const stockRaw = x?.quantity_available;
      const stock = stockRaw === undefined || stockRaw === null ? null : Number(stockRaw);
      const qty = Math.max(1, Math.floor(Number(x?.quantity || 1)));

      if (stock === null || Number.isNaN(stock)) return { ...x, quantity: qty };

      const capped = Math.min(qty, Math.max(0, stock));
      return { ...x, quantity_available: stock, quantity: Math.max(1, capped) };
    });
    return next;
  };

  // ✅ measure sticky footer height and apply bottom padding so list is never hidden
  const measureFooter = () => {
    if (!isMobile) return;
    const el = summaryRef.current;
    if (!el) return;

    const h = el.getBoundingClientRect().height || 0;
    // + safe area and breathing space
    setMobilePadBottom(Math.ceil(h + 18));
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(style);

    const handleResize = () => {
      const m = window.innerWidth < 800;
      setIsMobile(m);
      // wait layout then measure
      setTimeout(measureFooter, 0);
    };

    window.addEventListener("resize", handleResize);

    const initial = clampCart(readCart());
    setItems(initial);
    writeCart(initial);

    // measure after first paint
    setTimeout(measureFooter, 0);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.head.removeChild(style);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // whenever totals/items change, footer height can change
    setTimeout(measureFooter, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isMobile]);

  const updateQty = (product_id, qty) => {
    const next = items.map((x) => {
      if (x.product_id !== product_id) return x;

      const stockRaw = x?.quantity_available;
      const stock = stockRaw === undefined || stockRaw === null ? null : Number(stockRaw);

      let q = Math.max(1, Math.floor(Number(qty || 1)));
      if (stock !== null && !Number.isNaN(stock)) q = Math.min(q, Math.max(1, stock)); // cap
      return { ...x, quantity: q };
    });

    const normalized = clampCart(next);
    setItems(normalized);
    writeCart(normalized);
  };

  const removeItem = (product_id) => {
    const next = items.filter((x) => x.product_id !== product_id);
    setItems(next);
    writeCart(next);
  };

  const total = useMemo(
    () => items.reduce((s, x) => s + Number(x.price_coins || 0) * Number(x.quantity || 1), 0),
    [items]
  );

  const stockIssues = useMemo(() => {
    return items
      .map((x) => {
        const stockRaw = x?.quantity_available;
        const stock = stockRaw === undefined || stockRaw === null ? null : Number(stockRaw);
        if (stock === null || Number.isNaN(stock)) return null;
        if (stock <= 0) return x;
        if (Number(x.quantity || 1) > stock) return x;
        return null;
      })
      .filter(Boolean);
  }, [items]);

  const styles = {
    container: {
      width: "100%",
      maxWidth: "1000px",
      margin: "0 auto",
      padding: isMobile ? "14px" : "32px",
      paddingBottom: isMobile ? `${mobilePadBottom}px` : "32px",
      boxSizing: "border-box",
      animation: "fadeIn 0.4s ease-out",
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 14,
    },
    title: { margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 900, color: "#1e293b" },

    alertBar: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      background: "#fff7ed",
      border: "1px solid #fed7aa",
      color: "#9a3412",
      borderRadius: 14,
      padding: "12px 14px",
      marginBottom: 14,
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1.35,
    },

    layout: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
      gap: 16,
      alignItems: "start",
    },

    listContainer: { display: "flex", flexDirection: "column", gap: 12 },

    itemCard: {
      background: "white",
      borderRadius: 16,
      border: "1px solid #e2e8f0",
      padding: 14,
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      gap: 14,
      boxShadow: "0 2px 4px -1px rgba(0,0,0,0.02)",
      minWidth: 0,
    },
    itemTopRow: { display: "flex", gap: 12, alignItems: "center", width: "100%", minWidth: 0 },
    itemIconBox: {
      width: 56,
      height: 56,
      background: "#f1f5f9",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#64748b",
      flexShrink: 0,
    },
    itemDetails: { flex: 1, minWidth: 0 },
    itemName: {
      fontSize: 16,
      fontWeight: 900,
      color: "#0f172a",
      marginBottom: 3,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: "100%",
    },
    itemType: { fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 800 },
    stockText: { marginTop: 6, fontSize: 12, fontWeight: 800, color: "#475569" },

    controlsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 12, marginTop: isMobile ? 8 : 0 },

    qtyGroup: { display: "flex", alignItems: "center", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: 4, gap: 6 },
    qtyBtn: (disabled) => ({
      width: 30,
      height: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      background: "white",
      borderRadius: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      color: disabled ? "#cbd5e1" : "#475569",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      opacity: disabled ? 0.6 : 1,
    }),
    qtyVal: { width: 34, textAlign: "center", fontSize: 14, fontWeight: 900, color: "#0f172a" },

    priceBlock: { textAlign: "right", minWidth: 92 },
    priceVal: { fontSize: 16, fontWeight: 900, color: "#0f172a" },

    removeBtn: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: 8, borderRadius: 10 },

    summaryCard: {
      background: "white",
      borderRadius: isMobile ? 18 : 16,
      border: "1px solid #e2e8f0",
      padding: isMobile ? "12px 14px" : 18,
      position: isMobile ? "fixed" : "sticky",
      top: isMobile ? "auto" : 20,
      bottom: isMobile ? 0 : "auto",
      left: isMobile ? 0 : "auto",
      right: isMobile ? 0 : "auto",
      width: isMobile ? "100%" : "auto",
      boxSizing: "border-box",
      boxShadow: isMobile ? "0 -10px 30px rgba(0,0,0,0.08)" : "0 4px 6px -1px rgba(0,0,0,0.02)",
      zIndex: 10,
    },

    summaryTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 },
    summaryTitle: { margin: 0, fontSize: 15, fontWeight: 900, color: "#0f172a" },

    summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", fontWeight: 800, marginBottom: 6 },
    totalRow: { display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 10, borderTop: "1px solid #f1f5f9", fontSize: 16, fontWeight: 900, color: "#0f172a", marginBottom: 10 },

    checkoutBtn: (disabled) => ({
      width: "100%",
      padding: "14px",
      borderRadius: 14,
      border: "none",
      background: disabled ? "#94a3b8" : "#0f172a",
      color: "white",
      fontWeight: 900,
      fontSize: 16,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      opacity: disabled ? 0.85 : 1,
    }),

    emptyState: { textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16, border: "1px dashed #cbd5e1" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Cart</h2>
        <button
          onClick={() => nav("/shop")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#64748b",
            fontWeight: 900,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          type="button"
        >
          <Icons.ArrowLeft /> Shop
        </button>
      </div>

      {stockIssues.length > 0 && (
        <div style={styles.alertBar}>
          <div style={{ marginTop: 2 }}>
            <Icons.Alert />
          </div>
          <div>Some items exceed stock. Reduce quantity to continue checkout.</div>
        </div>
      )}

      {items.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ color: "#cbd5e1", marginBottom: 16 }}>
            <Icons.Bag />
          </div>
          <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>Your cart is empty</h3>
          <p style={{ margin: "0 0 24px 0", color: "#64748b", fontWeight: 700 }}>Add items from shop.</p>
          <button
            style={{ ...styles.checkoutBtn(false), width: "auto", display: "inline-flex", padding: "12px 16px" }}
            onClick={() => nav("/shop")}
            type="button"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={styles.layout}>
          <div style={styles.listContainer}>
            {items.map((x) => {
              const stockRaw = x?.quantity_available;
              const stock = stockRaw === undefined || stockRaw === null ? null : Number(stockRaw);
              const hasStock = stock !== null && !Number.isNaN(stock);
              const qty = Number(x.quantity || 1);

              const canMinus = qty > 1;
              const canPlus = !hasStock ? true : qty < stock;

              return (
                <div key={x.product_id} style={styles.itemCard}>
                  <div style={styles.itemTopRow}>
                    <div style={styles.itemIconBox}>
                      <Icons.Bag />
                    </div>

                    <div style={styles.itemDetails}>
                      <div style={styles.itemName} title={x.name}>
                        {x.name}
                      </div>
                      <div style={styles.itemType}>{String(x.product_type || "").toUpperCase()}</div>

                      {hasStock && (
                        <div style={styles.stockText}>
                          Stock: <span style={{ fontWeight: 900 }}>{stock}</span>
                          {qty > stock ? <span style={{ color: "#ef4444", marginLeft: 8, fontWeight: 900 }}>Too many</span> : null}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.controlsRow}>
                    <div style={styles.qtyGroup}>
                      <button style={styles.qtyBtn(!canMinus)} disabled={!canMinus} onClick={() => updateQty(x.product_id, qty - 1)} type="button">
                        <Icons.Minus />
                      </button>
                      <span style={styles.qtyVal}>{qty}</span>
                      <button style={styles.qtyBtn(!canPlus)} disabled={!canPlus} onClick={() => updateQty(x.product_id, qty + 1)} type="button">
                        <Icons.Plus />
                      </button>
                    </div>

                    <div style={styles.priceBlock}>
                      <div style={styles.priceVal}>{(Number(x.price_coins) * qty).toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800 }}>{Number(x.price_coins)} each</div>
                    </div>

                    <button style={styles.removeBtn} onClick={() => removeItem(x.product_id)} title="Remove" type="button">
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={styles.summaryCard} ref={summaryRef}>
            <div style={styles.summaryTop}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>
                Items: {items.reduce((a, c) => a + Number(c.quantity || 1), 0)}
              </div>
            </div>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{total.toLocaleString()}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Fees</span>
              <span>0</span>
            </div>

            <div style={styles.totalRow}>
              <span>Total</span>
              <span>
                {total.toLocaleString()} <small style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>coins</small>
              </span>
            </div>

            <button style={styles.checkoutBtn(stockIssues.length > 0)} disabled={stockIssues.length > 0} onClick={() => nav("/purchase")} type="button">
              Checkout <Icons.ArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
