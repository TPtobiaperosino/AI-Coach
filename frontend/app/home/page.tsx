"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // State Management
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [meals, setMeals] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const colors = {
    bg: "linear-gradient(135deg, #0f172a 0%, #0b1220 50%, #0f172a 100%)",
    card: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    accent: "#7c3aed",
    accentSoft: "rgba(124, 58, 237, 0.12)",
    text: "#e2e8f0",
    muted: "#94a3b8",
  };

  const buttonBase: React.CSSProperties = {
    borderRadius: 12,
    padding: "10px 16px",
    border: "1px solid " + colors.border,
    background: colors.card,
    color: colors.text,
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
  };

  const primaryButton: React.CSSProperties = {
    ...buttonBase,
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    border: "none",
    boxShadow: "0 10px 30px rgba(124,58,237,0.35)",
  };

  const subtleButton: React.CSSProperties = {
    ...buttonBase,
    background: "rgba(255,255,255,0.06)",
  };

  // Get Auth Token from LocalStorage on client side
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const idToken = localStorage.getItem("id_token");
    const foundToken = accessToken || idToken || null;
    setToken(foundToken);
    setIsLoading(false);
    
    if (!foundToken) {
      router.replace("/Login");
    }
  }, [router]);

  // --- ACTIONS ---

  async function handleUpload() {
    if (!file) return setStatus("Pick a file first");

    console.log("Token:", token);
    console.log("API_BASE:", API_BASE);

    if (!token) {
      setStatus("No auth token found. Please login again.");
      return;
    }

    if (!API_BASE) {
      setStatus("API_BASE not configured");
      return;
    }

    try {
      setBusy(true);
      setStatus("Step 1: Getting Presigned URL...");

      const url = `${API_BASE}/presign`;
      console.log("Fetching URL:", url);

      // 1. Get Presigned URL from Lambda Presign
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to get presigned URL: ${res.status} ${errorText}`);
      }

      const { uploadUrl, uploadId } = await res.json();

      setStatus("Step 2: Uploading directly to S3...");

      // 2. Upload File directly to S3 using PUT
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });

      setStatus(`Success! ID: ${uploadId}. Click Refresh to see results.`);
      setFile(null);
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      setStatus(`Upload failed: ${errorMessage}`);
      console.error("Full error:", err);
      console.error("Error name:", err?.name);
      console.error("Error message:", err?.message);
    } finally {
      setBusy(false);
    }
  }

  async function refreshMeals() {
    try {
      setBusy(true);
      setStatus("Fetching meals...");

      // Call Lambda Read
      const res = await fetch(`${API_BASE}/meals`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setMeals(data.items || []);
      setStatus(`Loaded ${data.items?.length || 0} meals`);
    } catch (err) {
      setStatus("Refresh failed.");
    } finally {
      setBusy(false);
    }
  }

  // Show loading while checking auth
  if (isLoading) {
    return <div style={{ textAlign: "center", marginTop: 100 }}>Loading...</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily: "'DM Sans', 'Inter', system-ui, -apple-system, sans-serif",
        padding: "40px 16px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999, background: colors.accentSoft, color: colors.accent, fontWeight: 700, letterSpacing: 0.3 }}>
              <span role="img" aria-label="sparkles">✨</span> AI Meal Coach
            </div>
            <h1 style={{ margin: "12px 0 4px", fontSize: 32, letterSpacing: -0.4 }}>Your smart meal log</h1>
            <p style={{ color: colors.muted, margin: 0 }}>Upload photos, get nutrition insights, track your progress.</p>
          </div>
          <button
            style={subtleButton}
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}
          >
            Logout
          </button>
        </header>

        {/* Upload + Status */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              background: colors.card,
              border: "1px solid " + colors.border,
              borderRadius: 18,
              padding: 20,
              boxShadow: "0 12px 50px rgba(0,0,0,0.35)",
            }}
          >
            <h3 style={{ margin: "0 0 12px", letterSpacing: -0.2 }}>Upload a meal</h3>
            <p style={{ margin: "0 0 12px", color: colors.muted, fontSize: 14 }}>
              Clear photo, plate visible. Supported formats: JPEG/PNG.
            </p>
            <label
              style={{
                display: "block",
                padding: "14px",
                borderRadius: 14,
                border: "1px dashed " + colors.border,
                background: "rgba(255,255,255,0.02)",
                marginBottom: 12,
                cursor: "pointer",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <span style={{ color: file ? colors.text : colors.muted }}>
                {file ? file.name : "Drag & drop or pick a photo"}
              </span>
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={primaryButton} onClick={handleUpload} disabled={busy || !file}>
                {busy ? "Working..." : "Upload photo"}
              </button>
              <button style={subtleButton} onClick={refreshMeals} disabled={busy}>
                Refresh list
              </button>
            </div>
          </div>

          <div
            style={{
              background: colors.card,
              border: "1px solid " + colors.border,
              borderRadius: 18,
              padding: 20,
              boxShadow: "0 12px 50px rgba(0,0,0,0.35)",
            }}
          >
            <h3 style={{ margin: "0 0 12px", letterSpacing: -0.2 }}>Status</h3>
            <p style={{ margin: 0, color: colors.text, fontWeight: 600 }}>{status || "Ready to upload"}</p>
          </div>
        </div>

        {/* Meals List */}
        <div style={{ display: "grid", gap: 16 }}>
          {meals.map((m, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: 16,
                border: "1px solid " + colors.border,
                padding: 16,
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 140,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid " + colors.border,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {m.imageUrl ? (
                  <img
                    src={m.imageUrl}
                    alt="meal"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{ color: colors.muted, fontSize: 12, textAlign: "center", paddingTop: 52 }}>
                    Processing...
                  </div>
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: colors.accentSoft,
                      color: colors.accent,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {m.status}
                  </span>
                  {m.errorMsg && <span style={{ color: "#f87171", fontSize: 12 }}>Error: {m.errorMsg}</span>}
                </div>
                <p style={{ margin: "0 0 8px", color: colors.muted, fontSize: 13 }}>
                  Creato: {new Date(m.createdAt).toLocaleString()}
                </p>
                {m.analysis ? (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      borderRadius: 12,
                      padding: 12,
                      color: colors.text,
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>Calories:</strong> {m.analysis.estimatedCalories} kcal
                    </p>
                    <p style={{ margin: "6px 0" }}>
                      <strong>Macros:</strong> P:{m.analysis.protein_g}g | C:{m.analysis.carbs_g}g | F:{m.analysis.fat_g}g
                    </p>
                    <p style={{ margin: "6px 0" }}>
                      <strong>Score:</strong> {m.analysis.mealScore}/10
                    </p>
                    <p style={{ margin: "6px 0", color: colors.muted }}>{m.analysis.summary}</p>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: colors.muted }}>Analysis in progress...</p>
                )}
              </div>
            </div>
          ))}
          {meals.length === 0 && (
            <div
              style={{
                border: "1px dashed " + colors.border,
                padding: 16,
                borderRadius: 14,
                color: colors.muted,
                textAlign: "center",
              }}
            >
              No meals yet. Upload a photo to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
