import { useEffect, useState } from "react";
import QRCode from "react-qr-code"; // npm install react-qr-code

export default function QRScanMenu() {
  const [qr, setQr] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const getQR = async () => {
      try {
        const res = await fetch("/api/qr");
        const data = await res.json();
        setQr(data.qr);
        setReady(data.ready);
      } catch {
        setQr(null);
        setReady(false);
      }
    };
    getQR();
    const intv = setInterval(getQR, 3000);
    return () => clearInterval(intv);
  }, []);

  if (ready) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <p style={{ color: "green", fontSize: 20, fontWeight: 600 }}>
          ? WhatsApp Bot Terhubung!
        </p>
        <p style={{ color: "#ccc" }}>Sudah login, tidak perlu scan ulang.</p>
      </div>
    );
  }

  if (qr) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <p>Silakan scan QR di bawah ini dari WhatsApp di HP Anda</p>
        <div style={{ display: "inline-block", padding: 18, background: "#fff", borderRadius: 10 }}>
          <QRCode value={qr} size={200} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <p>Menunggu QR code...</p>
    </div>
  );
}
