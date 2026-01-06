

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MealItem = {
  upload_id?: string;
  createdAt?: string;
  status?: string;
  analysis?: any;
  imageUrl?: string | null;
};

export default function HomePage() {
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [busy, setBusy] = useState<boolean>(false);

  const token = useMemo(() => {
    // Prefer access token if present; fallback to id token.
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("id_token") ||
      ""
    );
  }, []);

  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }
    if (!API_BASE) {
      // Don’t block routing, but make the error obvious.
      setStatus(
        "Missing NEXT_PUBLIC_API_BASE. Add it to .env.local (e.g. https://xxxx.execute-api.eu-west-2.amazonaws.com)"
      );
    }
  }, [router, token, API_BASE]);

  async function handleUpload() {
    if (!API_BASE) {
      setStatus("API base URL not configured (NEXT_PUBLIC_API_BASE).");
      return;
    }
    if (!token) {
      setStatus("Missing auth token. Please login again.");
      router.replace("/");
      return;
    }
    if (!file) {
      setStatus("Pick an image first.");
      return;
    }

    try {
      setBusy(true);
      setStatus("Requesting upload URL...");

      // 1) Ask backend for presigned PUT URL
      const presignRes = await fetch(`${API_BASE}/presign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: file.type || "image/jpeg",
        }),
      });

      if (!presignRes.ok) {
        const text = await presignRes.text();
        throw new Error(`Presign failed (${presignRes.status}): ${text}`);
      }

      const presignJson = await presignRes.json();
      const uploadUrl: string = presignJson.uploadUrl;
      const s3Key: string = presignJson.s3Key;
      const uploadId: string = presignJson.uploadId;

      if (!uploadUrl || !s3Key || !uploadId) {
        throw new Error(
          `Presign response missing fields. Got: ${JSON.stringify(presignJson)}`
        );
      }

      // 2) Upload directly to S3
      setStatus("Uploading to S3...");

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "image/jpeg",
        },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error(`S3 upload failed (${putRes.status}).`);
      }

      setStatus(`Uploaded ✅ (uploadId=${uploadId}). Processing...`);

      // Optional: immediately refresh meals list (processor is async, so status may still be UPLOADING/PROCESSING)
      await refreshMeals();
    } catch (err: any) {
      setStatus(err?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function refreshMeals() {
    if (!API_BASE) {
      setStatus("API base URL not configured (NEXT_PUBLIC_API_BASE).");
      return;
    }
    if (!token) {
      setStatus("Missing auth token. Please login again.");
      router.replace("/");
      return;
    }

    try {
      setBusy(true);
      setStatus("Refreshing meals...");

      const res = await fetch(`${API_BASE}/meals`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET /meals failed (${res.status}): ${text}`);
      }

      const json = await res.json();
      const items: MealItem[] = Array.isArray(json.items) ? json.items : [];
      setMeals(items);
      setStatus(`Loaded ${items.length} meal(s).`);
    } catch (err: any) {
      setStatus(err?.message || "Refresh failed.");
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.replace("/");
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Home</h1>
      <p>MVP: upload a meal photo → Bedrock estimates calories/macros and scores the meal.</p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button onClick={handleUpload} disabled={!file || busy}>
          Upload meal
        </button>
        <button onClick={refreshMeals} disabled={busy}>
          Refresh meals
        </button>
        <button onClick={handleLogout} disabled={busy}>
          Logout
        </button>
      </div>

      {status ? (
        <p style={{ marginTop: 12 }}>
          <strong>Status:</strong> {status}
        </p>
      ) : null}

      <hr style={{ margin: "24px 0" }} />

      <h2>Meals</h2>
      {meals.length === 0 ? (
        <p>No meals yet. Upload one, then click Refresh.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {meals.map((m, idx) => (
            <div
              key={`${m.upload_id ?? "noid"}-${idx}`}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
            >
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {m.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.imageUrl}
                    alt="meal"
                    style={{ width: 180, height: 180, objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 8,
                      background: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                    }}
                  >
                    No image
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div>
                    <strong>upload_id:</strong> {m.upload_id}
                  </div>
                  <div>
                    <strong>createdAt:</strong> {m.createdAt}
                  </div>
                  <div>
                    <strong>status:</strong> {m.status}
                  </div>

                  {m.analysis ? (
                    <div style={{ marginTop: 8 }}>
                      <div>
                        <strong>estimatedCalories:</strong> {m.analysis.estimatedCalories}
                      </div>
                      <div>
                        <strong>protein_g:</strong> {m.analysis.protein_g} | <strong>carbs_g:</strong>{" "}
                        {m.analysis.carbs_g} | <strong>fat_g:</strong> {m.analysis.fat_g}
                      </div>
                      <div>
                        <strong>mealScore:</strong> {m.analysis.mealScore}
                      </div>
                      <div>
                        <strong>summary:</strong> {m.analysis.summary}
                      </div>
                      <div>
                        <strong>confidenceNote:</strong> {m.analysis.confidenceNote}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, color: "#666" }}>No analysis yet.</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}