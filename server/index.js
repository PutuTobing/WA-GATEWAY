// server/index.js

const SCRIPT_VERSION = "12.0_DEVICE_MANAGEMENT";
console.log(`--- Memulai server/index.js versi ${SCRIPT_VERSION} ---`);

// --- Impor Modul ---
const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
require('dotenv').config();

// --- Path Konfigurasi ---
const usersDbPath = path.join(__dirname, 'users.json');

// --- Fungsi Bantuan ---
const readUsers = () => {
    if (!fs.existsSync(usersDbPath)) return [];
    try { return JSON.parse(fs.readFileSync(usersDbPath, 'utf8')); } catch { return []; }
};
const writeUsers = (data) => {
    fs.writeFileSync(usersDbPath, JSON.stringify(data, null, 2), 'utf8');
};

// --- Manajemen Sesi & Statistik ---
const sessions = {};
const sessionStatus = {};
const messageLogs = {};

// --- Setup Aplikasi Express ---
const app = express();
app.use(cors());
app.use(express.json());

// --- API Autentikasi & User ---
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Semua field wajib diisi.' });
    const users = readUsers();
    if (users.some(u => u.username === username)) return res.status(409).json({ message: 'Username sudah digunakan.' });
    if (users.some(u => u.email === email)) return res.status(409).json({ message: 'Email sudah terdaftar.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), username, email, password: hashedPassword, role: 'customer', status: 'pending', webhookUrl: '' };
    users.push(newUser);
    writeUsers(users);
    res.status(201).json({ message: 'Pendaftaran berhasil! Menunggu persetujuan admin.' });
});
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) return res.status(401).json({ message: "Username/email atau password salah." });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Username/email atau password salah." });
    if (user.status !== 'approved') return res.status(403).json({ message: "Akun Anda belum disetujui oleh admin." });
    res.status(200).json({
        message: "Login berhasil",
        token: "dummy-jwt-token-for-demo",
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
});
const isAdmin = (req, res, next) => {
    if (req.headers['x-user-role'] === 'admin') next();
    else res.status(403).json({ message: 'Akses ditolak. Hanya untuk admin.' });
};
app.get('/api/users', isAdmin, (req, res) => {
    const users = readUsers();
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.status(200).json(safeUsers);
});
app.post('/api/users/approve', isAdmin, (req, res) => {
    const { userId } = req.body;
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    users[userIndex].status = 'approved';
    writeUsers(users);
    res.status(200).json({ message: `Pengguna ${users[userIndex].username} telah disetujui.` });
});
// API untuk menolak akun (discard)
app.post('/api/users/discard', isAdmin, (req, res) => {
    const { userId } = req.body;
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    users[userIndex].status = 'ditolak';
    writeUsers(users);
    res.status(200).json({ message: `Pengguna ${users[userIndex].username} telah ditolak.` });
});
// API untuk memulihkan akun (restore)
app.post('/api/users/restore', isAdmin, (req, res) => {
    const { userId } = req.body;
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    users[userIndex].status = 'pending';
    writeUsers(users);
    res.status(200).json({ message: `Pengguna ${users[userIndex].username} dipulihkan ke status pending.` });
});
app.post('/api/users/reset-password', isAdmin, async (req, res) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) return res.status(400).json({ message: 'User ID dan password baru diperlukan.' });
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    writeUsers(users);
    res.status(200).json({ message: `Password untuk ${users[userIndex].username} telah direset.` });
});
app.delete('/api/users/:userId', isAdmin, (req, res) => {
    const { userId } = req.params;
    let users = readUsers();
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    if (users.length === initialLength) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    writeUsers(users);
    res.status(200).json({ message: 'Pengguna berhasil dihapus.' });
});

// --- API Manajemen Sesi WhatsApp ---
const createWhatsAppSession = (sessionId) => {
    console.log(`[${sessionId}] Mencoba membuat sesi WhatsApp baru...`);
    const client = new Client({ authStrategy: new LocalAuth({ clientId: sessionId }), puppeteer: { executablePath: puppeteer.executablePath(), args: ['--no-sandbox', '--disable-setuid-sandbox'] } });
    
    sessionStatus[sessionId] = { qr: null, isReady: false, message: "Menginisialisasi...", number: '', profilePicUrl: '', connectedAt: null, disconnectedAt: null, sentCount: 0, receivedCount: 0 };
    if (!messageLogs[sessionId]) { messageLogs[sessionId] = []; }

    client.on('qr', qr => {
        console.log(`[${sessionId}] QR DITERIMA.`);
        sessionStatus[sessionId].qr = qr;
        sessionStatus[sessionId].isReady = false;
        sessionStatus[sessionId].message = "Silakan pindai QR code untuk terhubung.";
    });

    client.on('ready', async () => {
        console.log(`[${sessionId}] ? Bot Siap!`);
        sessionStatus[sessionId].qr = null;
        sessionStatus[sessionId].isReady = true;
        sessionStatus[sessionId].message = "Bot siap digunakan!";
        sessionStatus[sessionId].number = client.info.wid.user;
        sessionStatus[sessionId].connectedAt = new Date().toISOString();
        try {
            sessionStatus[sessionId].profilePicUrl = await client.getProfilePicUrl(client.info.wid._serialized);
        } catch (e) {
            console.error(`[${sessionId}] Gagal mengambil foto profil.`);
            sessionStatus[sessionId].profilePicUrl = '';
        }
    });
    
    client.on('message', async msg => {
        if (sessionStatus[sessionId]) sessionStatus[sessionId].receivedCount++;
        
        if (!messageLogs[sessionId]) { messageLogs[sessionId] = []; }
        const logEntry = { id: msg.id.id, sender: msg.from, message: msg.body, timestamp: new Date().toISOString() };
        messageLogs[sessionId].unshift(logEntry);
        if (messageLogs[sessionId].length > 100) { messageLogs[sessionId].pop(); }
        
        const users = readUsers();
        const currentUser = users.find(u => u.id === sessionId);
        if (currentUser && currentUser.webhookUrl) {
            try {
                await axios.post(currentUser.webhookUrl, logEntry);
            } catch (error) {
                console.error(`[${sessionId}] Gagal meneruskan pesan ke webhook: ${error.message}`);
            }
        }
    });

    client.on('disconnected', (reason) => {
        console.log(`[${sessionId}] ?? Terputus! Alasan: ${reason}`);
        if (sessionStatus[sessionId]) {
            sessionStatus[sessionId].disconnectedAt = new Date().toISOString();
        }
        delete sessions[sessionId];
    });

    client.initialize().catch(err => {
        console.error(`[${sessionId}] Gagal inisialisasi:`, err);
        delete sessionStatus[sessionId];
    });
    
    sessions[sessionId] = client;
};

app.post('/api/sessions/init', (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Session ID diperlukan." });
    if (sessions[sessionId]) return res.status(200).json({ message: "Sesi sudah ada." });
    createWhatsAppSession(sessionId);
    res.status(201).json({ message: "Sesi sedang diinisialisasi." });
});

app.get('/api/sessions/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const status = sessionStatus[sessionId];
    if (status) res.status(200).json(status);
    else res.status(404).json({ qr: null, isReady: false, message: "Sesi tidak aktif." });
});

app.post('/api/sessions/send', async (req, res) => {
    const { sessionId, number, message } = req.body;
    if (!sessionId || !number || !message) return res.status(400).json({ success: false, message: 'Session ID, nomor, dan pesan wajib diisi.' });
    const client = sessions[sessionId];
    const status = sessionStatus[sessionId];
    if (!client || !status || !status.isReady) return res.status(409).json({ success: false, message: "Sesi WhatsApp untuk pengguna ini belum siap." });
    try {
        const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
        await client.sendMessage(formattedNumber, message);
        if (sessionStatus[sessionId]) sessionStatus[sessionId].sentCount++;
        res.status(200).json({ success: true, message: "Pesan berhasil dikirim." });
    } catch (e) {
        res.status(500).json({ success: false, message: `Gagal mengirim pesan: ${e.message}` });
    }
});

app.get('/api/sessions/logs/:sessionId', (req, res) => {
    const logs = messageLogs[sessionId] || [];
    res.status(200).json(logs);
});

// API BARU: Mendapatkan semua sesi untuk admin
app.get('/api/devices', isAdmin, (req, res) => {
    const allUsers = readUsers();
    const allDevices = allUsers
        .filter(u => u.role === 'customer')
        .map(u => {
            const status = sessionStatus[u.id];
            return {
                userId: u.id,
                username: u.username,
                number: status ? status.number : 'N/A',
                isReady: status ? status.isReady : false,
                profilePicUrl: status ? status.profilePicUrl : '',
                connectedAt: status ? status.connectedAt : null,
                disconnectedAt: status ? status.disconnectedAt : null,
                sentCount: status ? status.sentCount : 0,
                receivedCount: status ? status.receivedCount : 0,
                webhookUrl: u.webhookUrl || ''
            };
        });
    res.status(200).json(allDevices);
});

// API BARU: Memutuskan koneksi sesi
app.post('/api/sessions/disconnect', async (req, res) => {
    // Dibuat agar bisa diakses admin dan pengguna sendiri
    const { sessionId } = req.body;
    const client = sessions[sessionId];
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === sessionId);
    if (client) {
        try {
            await client.logout();
            // Update status akun di database
            if (userIndex !== -1) {
                users[userIndex].status = 'stopped';
                writeUsers(users);
            }
            res.status(200).json({ message: "Sesi berhasil diputuskan." });
        } catch (e) {
            res.status(500).json({ message: "Gagal memutuskan sesi." });
        }
    } else {
        // Jika tidak ada sesi, tetap update status di database
        if (userIndex !== -1) {
            users[userIndex].status = 'stopped';
            writeUsers(users);
        }
        res.status(404).json({ message: "Sesi tidak ditemukan atau sudah offline." });
    }
});
// --- Akhir API Sesi ---

// --- API Webhook ---
app.get('/api/webhook/:userId', (req, res) => {
    const { userId } = req.params;
    const users = readUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        res.status(200).json({ url: user.webhookUrl || '' });
    } else {
        res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }
});
app.post('/api/webhook', (req, res) => {
    const { userId, url } = req.body;
    if (!userId || url === undefined) return res.status(400).json({ message: 'User ID dan URL diperlukan.' });
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    users[userIndex].webhookUrl = url;
    writeUsers(users);
    res.status(200).json({ message: 'URL Webhook berhasil diperbarui!' });
});

// --- Jalankan Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`?? Server backend v${SCRIPT_VERSION} berjalan di http://172.16.31.14:${PORT}`);
});
