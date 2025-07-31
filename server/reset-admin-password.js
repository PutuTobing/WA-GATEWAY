// server/reset-admin-password.js (v3 - Pengubah Kredensial)

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersDbPath = path.join(__dirname, 'users.json');

const changeAdminCredentials = async () => {
    console.log('Membaca file users.json...');
    let users = [];
    try {
        if (fs.existsSync(usersDbPath)) {
            const fileContent = fs.readFileSync(usersDbPath, 'utf8');
            users = JSON.parse(fileContent);
        } else {
            console.error('Error: File users.json tidak ditemukan!');
            return;
        }
    } catch (e) {
        console.error('Error: Gagal membaca atau mem-parsing users.json.', e);
        return;
    }

    // Cari pengguna dengan peran 'admin'
    const adminIndex = users.findIndex(u => u.role === 'admin');

    if (adminIndex === -1) {
        console.error('Error: Akun dengan peran "admin" tidak ditemukan.');
        return;
    }

    // Kredensial baru yang Anda inginkan
    const newUsername = 'BTD';
    const newPassword = 'Balionelove_121';

    console.log(`Menemukan admin. Mengubah kredensial menjadi:`);
    console.log(`  -> Username Baru: ${newUsername}`);
    console.log(`  -> Password Baru: ${newPassword}`);

    // Enkripsi password baru
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Perbarui username dan password di dalam data
    users[adminIndex].username = newUsername;
    users[adminIndex].password = newHashedPassword;

    try {
        // Tulis kembali data yang sudah diperbarui ke file
        fs.writeFileSync(usersDbPath, JSON.stringify(users, null, 2), 'utf8');
        console.log('? Berhasil! Kredensial admin telah diperbarui.');
        console.log('Silakan jalankan server dan login dengan username dan password baru.');
    } catch (e) {
        console.error('Error: Gagal menulis kembali ke file users.json.', e);
    }
};

changeAdminCredentials();
