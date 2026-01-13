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
    <div style={{ maxWidth: 800, margin: "50px auto", fontFamily: "sans-serif" }}>
      <h1>AI Meal Coach - Dashboard</h1>

      {/* Upload Section */}
      <div style={{ background: "#f4f4f4", padding: 20, borderRadius: 10 }}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUpload} disabled={busy || !file}>Upload Photo</button>
        <button onClick={refreshMeals} disabled={busy}>Refresh List</button>
        <button onClick={() => { localStorage.clear(); router.push("/"); }}>Logout</button>
        <p><strong>Status:</strong> {status}</p>
      </div>

      <hr />

      {/* Meals List */}
      <div style={{ display: "grid", gap: 20 }}>
        {meals.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 20, border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
            <img src={m.imageUrl} alt="meal" style={{ width: 150, height: 150, objectFit: "cover", borderRadius: 5 }} />
            <div>
              <h3>Status: {m.status}</h3>
              {m.errorMsg && <p style={{ color: "red" }}>Error: {m.errorMsg}</p>}
              <p>Created: {new Date(m.createdAt).toLocaleString()}</p>
              {m.analysis ? (
                <div style={{ background: "#eeffee", padding: 10 }}>
                  <p><strong>Calories:</strong> {m.analysis.estimatedCalories} kcal</p>
                  <p><strong>Macros:</strong> P:{m.analysis.protein_g}g | C:{m.analysis.carbs_g}g | F:{m.analysis.fat_g}g</p>
                  <p><strong>Score:</strong> {m.analysis.mealScore}/10</p>
                  <p><i>{m.analysis.summary}</i></p>
                </div>
              ) : <p>Analysis in progress...</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
