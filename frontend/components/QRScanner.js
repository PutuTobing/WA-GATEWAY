// components/QRScanner.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import QRCode from 'react-qr-code';
import axios from 'axios';

export default function QRScanner() {
const [qr, setQr] = useState(null);
const [ready, setReady] = useState(false);

useEffect(() => {
 // 1. Socket.io (primary)
 const socket = io('http://172.16.31.14:3000', { transports: ['websocket'] });
 socket.on('qr', data => setQr(data));
 socket.on('ready', () => setReady(true));

 // 2. Polling HTTP sebagai backup
 const iv = setInterval(async () => {
   try {
     const { data } = await axios.get('http://172.16.31.14:3000/api/qr');
     if (data.qr) setQr(data.qr);
     if (data.ready) setReady(true);
   } catch (e) {
     console.error('Polling /api/qr gagal', e);
   }
 }, 5000);

 return () => clearInterval(iv);
}, []);

if (ready) return <div className="text-green-500">?? Bot Connected</div>;
if (!qr)  return <div>?? Menunggu QR...</div>;
return (
 <div className="p-4 bg-white rounded shadow inline-block">
   <QRCode value={qr} size={256} />
 </div>
);
}