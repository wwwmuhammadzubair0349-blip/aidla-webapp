// src/pages/dashboard/Shop.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

// --- Icons ---
const Icons = {
  Cart: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),

  Bag: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),

  Alert: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),

  Back: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
};

// --- Skeleton Loader ---
const ProductSkeleton = () => (
  <div
    style={{
      background: "white",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      animation: "pulse 1.5s infinite",
    }}
  >
    <div style={{ height: "140px", background: "#f1f5f9" }}></div>
    <div style={{ padding: "10px" }}>
      <div
        style={{
          height: "16px",
          width: "70%",
          background: "#f1f5f9",
          marginBottom: "8px",
          borderRadius: "4px",
        }}
      ></div>
      <div
        style={{
          height: "12px",
          width: "40%",
          background: "#f1f5f9",
          marginBottom: "12px",
          borderRadius: "4px",
        }}
      ></div>
      <div
        style={{
          height: "30px",
          width: "100%",
          background: "#f1f5f9",
          borderRadius: "6px",
        }}
      ></div>
    </div>
  </div>
);

const CART_KEY = "aidla_cart_v1";

export default function Shop() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [imgUrls, setImgUrls] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    // Responsive Listener
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);

    // Styles
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.head.removeChild(style);
    };
  }, []);

  const styles = {
    container: {
      width: "100%",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: isMobile ? "12px" : "20px",
      boxSizing: "border-box",
      animation: "fadeIn 0.4s ease-out",
      minWidth: 0,
    },

    header: {
      marginBottom: isMobile ? "16px" : "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      flexWrap: "wrap",
    },

    titleWrap: {
      display: "flex",
      flexDirection: "column",
    },

    title: {
      margin: 0,
      fontSize: "24px",
      fontWeight: 800,
      color: "#1e293b",
      letterSpacing: "-0.02em",
    },

    subtitle: {
      margin: "4px 0 0",
      color: "#64748b",
      fontSize: "14px",
      fontWeight: 500,
    },

    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 12px",
      borderRadius: 999,
      border: "1px solid #e2e8f0",
      background: "#fff",
      fontWeight: 700,
      cursor: "pointer",
      color: "#0f172a",
      transition: "0.15s",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "repeat(2, 1fr)"
        : "repeat(auto-fill, minmax(240px, 1fr))",
      gap: isMobile ? "10px" : "20px",
      width: "100%",
    },

    card: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: isMobile ? "12px" : "16px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 2px 4px -1px rgba(0,0,0,0.02)",
    },

    imageContainer: {
      width: "100%",
      height: isMobile ? "140px" : "200px",
      position: "relative",
      background: "#f8fafc",
      borderBottom: "1px solid #f1f5f9",
    },

    img: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },

    badgeContainer: {
      position: "absolute",
      top: isMobile ? "8px" : "12px",
      left: isMobile ? "8px" : "12px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },

    badge: (type) => ({
      padding: "3px 8px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: 700,
      textTransform: "uppercase",
      color: "white",
      background:
        type === "sale"
          ? "#ef4444"
          : type === "stock"
          ? "rgba(0,0,0,0.7)"
          : "#3b82f6",
    }),

    content: {
      padding: isMobile ? "10px" : "16px",
      display: "flex",
      flexDirection: "column",
      flex: 1,
    },

    type: {
      fontSize: "10px",
      color: "#94a3b8",
      fontWeight: 700,
      textTransform: "uppercase",
    },

    name: {
      fontSize: isMobile ? "14px" : "16px",
      fontWeight: 700,
      color: "#0f172a",
      margin: "2px 0 4px",
      lineHeight: 1.3,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },

    priceRow: {
      display: "flex",
      alignItems: "baseline",
      gap: "6px",
      marginBottom: isMobile ? "8px" : "12px",
      flexWrap: "wrap",
    },

    currentPrice: {
      fontSize: isMobile ? "15px" : "18px",
      fontWeight: 800,
      color: "#0f172a",
    },

    oldPrice: {
      fontSize: "11px",
      color: "#94a3b8",
      textDecoration: "line-through",
    },

    btnRow: {
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: "6px",
      marginTop: "auto",
    },

    btn: (primary, disabled) => ({
      padding: isMobile ? "8px 4px" : "10px",
      borderRadius: "8px",
      border: primary ? "none" : "1px solid #e2e8f0",
      background: primary ? "#0f172a" : "white",
      color: primary ? "white" : "#0f172a",
      fontWeight: 700,
      fontSize: isMobile ? "12px" : "13px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
    }),

    alert: (type) => ({
      marginTop: "16px",
      padding: "12px 16px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: 600,
      background: type === "error" ? "#fee2e2" : "#f1f5f9",
      color: type === "error" ? "#991b1b" : "#475569",
      border: `1px solid ${
        type === "error" ? "#fecaca" : "#e2e8f0"
      }`,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),
  };

  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const setCart = (items) =>
    localStorage.setItem(CART_KEY, JSON.stringify(items));

const addToCart = (p) => {
  const cart = getCart();
  const idx = cart.findIndex((x) => x.product_id === p.id);

  const stock = Number(p.quantity ?? 0); // ✅ from your products list
  if (stock <= 0) return; // sold out safeguard

  if (idx >= 0) {
    const nextQty = Math.min(stock, Number(cart[idx].quantity || 1) + 1);
    cart[idx] = { ...cart[idx], quantity: nextQty, quantity_available: stock };
  } else {
    cart.push({
      product_id: p.id,
      name: p.name,
      price_coins: p.final_price,
      quantity: 1,
      image_path: p.image_path,
      product_type: p.product_type,
      quantity_available: stock, // ✅ SAVE STOCK
    });
  }

  setCart(cart);
  nav("/cart");
};

const buyNow = (p) => {
  const stock = Number(p.quantity ?? 0);
  if (stock <= 0) return;

  setCart([
    {
      product_id: p.id,
      name: p.name,
      price_coins: p.final_price,
      quantity: 1,
      image_path: p.image_path,
      product_type: p.product_type,
      quantity_available: stock, // ✅ SAVE STOCK
    },
  ]);
  nav("/purchase");
};


  const signImage = async (path) => {
    if (!path || imgUrls[path]) return;
    const { data, error } = await supabase.storage
      .from("shop_images")
      .createSignedUrl(path, 3600);
    if (!error)
      setImgUrls((m) => ({ ...m, [path]: data.signedUrl }));
  };

  const calcFinalPrice = (p) => {
    let price = Number(p.price_coins || 0);
    if (p.offer_type === "percent" && Number(p.offer_value) > 0) {
      price = Math.max(
        0,
        Math.floor(price * (1 - Number(p.offer_value) / 100))
      );
    } else if (p.offer_type === "flat" && Number(p.offer_value) > 0) {
      price = Math.max(0, price - Number(p.offer_value));
    }
    return price;
  };

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase.rpc("user_list_products");
      if (error) throw error;
      const list = (Array.isArray(data) ? data : []).map((p) => ({
        ...p,
        final_price: calcFinalPrice(p),
      }));
      setRows(list);
      list.forEach((p) => {
        if (p.image_path) signImage(p.image_path);
      });
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={styles.container}>
      {/* Header + Back Button */}
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <h2 style={styles.title}>Shop</h2>
          <p style={styles.subtitle}>Redeem AIDLA Coins</p>
        </div>

        {/* ✅ Back Button */}
        <button style={styles.backBtn} onClick={() => nav("/dashboard")}>
          <Icons.Back /> Dashboard
        </button>
      </div>

      {errorMsg && (
        <div style={styles.alert("error")}>
          <Icons.Alert /> {errorMsg}
        </div>
      )}

      {/* Products Grid */}
      <div style={styles.grid}>
        {loading ? (
          <>
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </>
        ) : rows.length === 0 ? (
          <div
            style={{
              ...styles.alert("default"),
              gridColumn: "1 / -1",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            No products available.
          </div>
        ) : (
          rows.map((p) => {
            const isOutOfStock = p.quantity <= 0;
            const hasDiscount = p.final_price !== Number(p.price_coins);

            return (
              <div
                key={p.id}
                style={{
                  ...styles.card,
                  opacity: isOutOfStock ? 0.7 : 1,
                }}
              >
                {/* Image */}
                <div style={styles.imageContainer}>
                  {p.image_path && imgUrls[p.image_path] ? (
                    <img
                      alt={p.name}
                      style={{
                        ...styles.img,
                        filter: isOutOfStock
                          ? "grayscale(100%)"
                          : "none",
                      }}
                      src={imgUrls[p.image_path]}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#cbd5e1",
                      }}
                    >
                      <Icons.Bag />
                    </div>
                  )}

                  {/* Badges */}
                  <div style={styles.badgeContainer}>
                    {isOutOfStock && (
                      <span
                        style={{
                          ...styles.badge("stock"),
                          background: "#1e293b",
                        }}
                      >
                        Sold Out
                      </span>
                    )}
                    {hasDiscount && (
                      <span style={styles.badge("sale")}>Sale</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div style={styles.content}>
                  <div style={styles.type}>{p.product_type}</div>
                  <div style={styles.name}>{p.name}</div>

                  <div style={styles.priceRow}>
                    <span style={styles.currentPrice}>
                      {Number(p.final_price).toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span style={styles.oldPrice}>
                        {Number(p.price_coins).toLocaleString()}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      Coins
                    </span>
                  </div>

                  <div style={styles.btnRow}>
                    <button
                      style={styles.btn(true, isOutOfStock)}
                      onClick={() => buyNow(p)}
                      disabled={isOutOfStock}
                    >
                      Buy
                    </button>

                    <button
                      style={styles.btn(false, isOutOfStock)}
                      onClick={() => addToCart(p)}
                      disabled={isOutOfStock}
                      title="Add to Cart"
                    >
                      <Icons.Cart />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
