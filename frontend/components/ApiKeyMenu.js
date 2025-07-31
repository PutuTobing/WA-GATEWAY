import React, { useState, useEffect } from "react";

// Ambil atau simpan Webhook ke API backend Next.js
export default function ApiKeyMenu() {
  const [webhook, setWebhook] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Ambil setting webhook saat pertama kali render
  useEffect(() => {
    fetch("/api/webhook")
      .then(res => res.json())
      .then(data => setWebhook(data.webhook || ""))
      .catch(() => setWebhook(""));
  }, []);

  // Simpan ke server
  const saveWebhook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const res = await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhook }),
    });
    setLoading(false);
    setSaved(res.ok);
  };

  return (
    <div style={{padding:24, background:'#fff', borderRadius:12, maxWidth:400, margin:'24px auto', boxShadow:'0 2px 8px #0001'}}>
      <h3>Setting Webhook n8n</h3>
      <form onSubmit={saveWebhook}>
        <label>Webhook URL n8n:</label>
        <input
          type="text"
          value={webhook}
          onChange={e => setWebhook(e.target.value)}
          style={{width:'100%', padding:8, margin:'8px 0', borderRadius:8, border:'1px solid #ddd'}}
          placeholder="Contoh: https://n8n.btd.co.id/webhook/WA-IN"
        />
        <button
          type="submit"
          style={{padding:'10px 18px', borderRadius:8, background:'#2563eb', color:'#fff', border:'none'}}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
      {saved && <div style={{color:'green',marginTop:8}}>Berhasil disimpan!</div>}
    </div>
  );
}
