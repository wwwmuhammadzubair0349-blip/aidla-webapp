import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminMiningManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [miningSpeed12h, setMiningSpeed12h] = useState(120);

  const [googleAdsEnabled, setGoogleAdsEnabled] = useState(true);
  const [sponsorAdsEnabled, setSponsorAdsEnabled] = useState(true);

  const [googleAdClientId, setGoogleAdClientId] = useState("");
  const [googleAdUnitId, setGoogleAdUnitId] = useState("");

  const [sponsorAdTitle, setSponsorAdTitle] = useState("");
  const [sponsorAdLink, setSponsorAdLink] = useState("");

  const [applySpeedToAllUsers, setApplySpeedToAllUsers] = useState(false);

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const styles = {
    title: { margin: 0, fontSize: 20, fontWeight: 900 },
    sub: { marginTop: 6, color: "#6b7280", fontWeight: 700, lineHeight: 1.6 },

    card: {
      marginTop: 12,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 16,
    },

    grid: {
      marginTop: 12,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 12,
    },

    field: {
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 12,
      background: "#f9fafb",
    },
    label: { display: "block", fontWeight: 900, marginBottom: 8 },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      outline: "none",
      background: "#fff",
      fontWeight: 800,
    },

    toggleRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    toggleBtn: (on) => ({
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: on ? "#111827" : "#fff",
      color: on ? "#fff" : "#111827",
      fontWeight: 900,
      cursor: "pointer",
      minWidth: 110,
      textAlign: "center",
    }),

    row: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
    btnPrimary: {
      padding: "10px 12px",
      borderRadius: 12,
      border: 0,
      background: "#0d6efd",
      color: "#fff",
      fontWeight: 900,
      cursor: "pointer",
      opacity: saving ? 0.7 : 1,
    },
    btnGhost: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      color: "#111827",
      fontWeight: 900,
      cursor: "pointer",
    },

    msgOk: {
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 12,
      background: "#ecfeff",
      border: "1px solid #a5f3fc",
      color: "#155e75",
      fontWeight: 800,
      lineHeight: 1.5,
    },
    msgErr: {
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 12,
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#991b1b",
      fontWeight: 800,
      lineHeight: 1.5,
    },
    small: { marginTop: 8, color: "#6b7280", fontSize: 13, lineHeight: 1.6 },
    divider: { marginTop: 14, borderTop: "1px solid #e5e7eb" },
    checkRow: { marginTop: 12, display: "flex", gap: 10, alignItems: "center" },
    checkbox: { width: 18, height: 18 },
  };

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      const { data, error } = await supabase.rpc("admin_get_mining_settings");
      if (error) throw error;
      if (!data) throw new Error("No settings row found (id=1).");

      setMiningSpeed12h(Number(data.mining_speed_per_12h ?? 120));
      setGoogleAdsEnabled(Boolean(data.ads_google_enabled));
      setSponsorAdsEnabled(Boolean(data.ads_sponsor_enabled));

      setGoogleAdClientId(data.google_ad_client_id ?? "");
      setGoogleAdUnitId(data.google_ad_unit_id ?? "");

      setSponsorAdTitle(data.sponsor_ad_title ?? "");
      setSponsorAdLink(data.sponsor_ad_link ?? "");
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load mining settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setErrorMsg("");
    setStatusMsg("");

    try {
      const speed = Number(miningSpeed12h);
      if (Number.isNaN(speed) || speed < 0) {
        throw new Error("Mining speed must be 0 or a positive number.");
      }

      const { error } = await supabase.rpc("admin_update_mining_settings", {
        p_mining_speed_per_12h: Math.floor(speed),
        p_ads_google_enabled: googleAdsEnabled,
        p_ads_sponsor_enabled: sponsorAdsEnabled,
        p_google_ad_client_id: googleAdClientId,
        p_google_ad_unit_id: googleAdUnitId,
        p_sponsor_ad_title: sponsorAdTitle,
        p_sponsor_ad_link: sponsorAdLink,
        p_apply_speed_to_all_users: applySpeedToAllUsers,
      });

      if (error) throw error;

      setStatusMsg("Settings saved ✅");
      setApplySpeedToAllUsers(false);
      await loadSettings();
    } catch (e) {
      setErrorMsg(e?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setMiningSpeed12h(120);
    setGoogleAdsEnabled(true);
    setSponsorAdsEnabled(true);
    setGoogleAdClientId("");
    setGoogleAdUnitId("");
    setSponsorAdTitle("");
    setSponsorAdLink("");
    setApplySpeedToAllUsers(false);
    setStatusMsg("Defaults loaded (not saved yet).");
    setErrorMsg("");
  };

  if (loading) {
    return (
      <div>
        <h2 style={styles.title}>Mining Management</h2>
        <p style={styles.sub}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={styles.title}>Mining Management</h2>
      <p style={styles.sub}>
        Set mining speed and ad settings. (User mining page can read these later.)
      </p>

      <div style={styles.card}>
        <div style={styles.grid}>
          {/* Mining speed */}
          <div style={styles.field}>
            <label style={styles.label}>Mining Speed (Coins per 12 hours)</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              step="1"
              value={miningSpeed12h}
              onChange={(e) => setMiningSpeed12h(e.target.value)}
              placeholder="e.g. 120"
            />
            <div style={styles.small}>
              This is the full reward after 12 hours (claim).
            </div>
          </div>

          {/* Google Ads toggle */}
          <div style={styles.field}>
            <div style={styles.toggleRow}>
              <div>
                <div style={{ fontWeight: 900 }}>Google Ads</div>
                <div style={styles.small}>Enable/Disable Google ads</div>
              </div>
              <button
                style={styles.toggleBtn(googleAdsEnabled)}
                onClick={() => setGoogleAdsEnabled((v) => !v)}
                type="button"
              >
                {googleAdsEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>

          {/* Sponsor Ads toggle */}
          <div style={styles.field}>
            <div style={styles.toggleRow}>
              <div>
                <div style={{ fontWeight: 900 }}>Local Sponsor Ads</div>
                <div style={styles.small}>Enable/Disable sponsor ads</div>
              </div>
              <button
                style={styles.toggleBtn(sponsorAdsEnabled)}
                onClick={() => setSponsorAdsEnabled((v) => !v)}
                type="button"
              >
                {sponsorAdsEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>

          {/* Google Ad IDs */}
          <div style={styles.field}>
            <label style={styles.label}>Google Ad Client ID</label>
            <input
              style={styles.input}
              value={googleAdClientId}
              onChange={(e) => setGoogleAdClientId(e.target.value)}
              placeholder="ca-pub-xxxxxxxxxxxxxxxx"
            />
            <div style={styles.small}>Example: ca-pub-1234567890123456</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Google Ad Unit ID</label>
            <input
              style={styles.input}
              value={googleAdUnitId}
              onChange={(e) => setGoogleAdUnitId(e.target.value)}
              placeholder="xxxxxxxxxx"
            />
            <div style={styles.small}>Your ad unit identifier (as you use in frontend later).</div>
          </div>

          {/* Sponsor ad info */}
          <div style={styles.field}>
            <label style={styles.label}>Sponsor Ad Title</label>
            <input
              style={styles.input}
              value={sponsorAdTitle}
              onChange={(e) => setSponsorAdTitle(e.target.value)}
              placeholder="e.g. Syed Solar Energy"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Sponsor Ad Link</label>
            <input
              style={styles.input}
              value={sponsorAdLink}
              onChange={(e) => setSponsorAdLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.checkRow}>
          <input
            style={styles.checkbox}
            type="checkbox"
            checked={applySpeedToAllUsers}
            onChange={(e) => setApplySpeedToAllUsers(e.target.checked)}
          />
          <div style={{ fontWeight: 900 }}>
            Apply mining speed to ALL users now
          </div>
        </div>
        <div style={styles.small}>
          If checked, it will update <b>user_profiles.mining_speed_per_12h</b> for every user.
          (Useful if your current mining logic uses per-user speed.)
        </div>

        <div style={styles.row}>
          <button style={styles.btnPrimary} onClick={saveSettings} disabled={saving} type="button">
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <button style={styles.btnGhost} onClick={resetToDefaults} disabled={saving} type="button">
            Reset Form
          </button>
          <button style={styles.btnGhost} onClick={loadSettings} disabled={saving} type="button">
            Reload From DB
          </button>
        </div>

        {statusMsg ? <div style={styles.msgOk}>{statusMsg}</div> : null}
        {errorMsg ? <div style={styles.msgErr}>{errorMsg}</div> : null}
      </div>
    </div>
  );
}
