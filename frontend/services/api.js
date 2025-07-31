// Alamat IP dan port server backend Anda.
// Menggunakan variabel ini memastikan jika alamat server berubah, Anda hanya perlu mengubahnya di satu tempat.
const API_URL = 'http://172.16.31.14:3001/api';

// --- FUNGSI UNTUK MANAJEMEN PENGGUNA ---

/**
 * Mengambil daftar lengkap pengguna dari server.
 * Fungsi ini dirancang untuk hanya dapat diakses oleh admin.
 * @returns {Promise<Array>} Sebuah promise yang akan resolve menjadi array objek pengguna.
 * @throws {Error} Akan melemparkan eror jika panggilan API gagal atau jika server mengembalikan status tidak berhasil (non-2xx).
 */
export const getUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                // Di aplikasi nyata, ini akan diganti dengan token autentikasi (JWT)
                // untuk verifikasi di sisi backend.
                'x-user-role': 'admin' 
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mengambil data pengguna dari server.');
        }
        return await response.json();
    } catch (error) {
        console.error("Detail Eror di getUsers:", error);
        throw error;
    }
};

/**
 * Menyetujui pendaftaran pengguna yang statusnya masih 'pending'.
 * Fungsi ini hanya dapat diakses oleh admin.
 * @param {string} userId - ID unik dari pengguna yang akan disetujui.
 * @returns {Promise<Object>} Mengembalikan objek respons dari server, biasanya berisi pesan sukses.
 * @throws {Error} Akan melemparkan eror jika ID pengguna tidak ditemukan atau terjadi kegagalan di server.
 */
export const approveUser = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/users/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': 'admin'
            },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menyetujui pengguna.');
        }
        return await response.json();
    } catch (error) {
        console.error("Detail Eror di approveUser:", error);
        throw error;
    }
};

/**
 * Mereset kata sandi untuk pengguna tertentu.
 * Fungsi ini hanya dapat diakses oleh admin.
 * @param {string} userId - ID pengguna yang kata sandinya akan direset.
 * @param {string} newPassword - Kata sandi baru untuk pengguna tersebut.
 * @returns {Promise<Object>} Mengembalikan objek respons dari server.
 */
export const resetUserPassword = async (userId, newPassword) => {
    try {
        const response = await fetch(`${API_URL}/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': 'admin'
            },
            body: JSON.stringify({ userId, newPassword })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mereset kata sandi.');
        }
        return await response.json();
    } catch (error) {
        console.error("Detail Eror di resetUserPassword:", error);
        throw error;
    }
};

/**
 * Menghapus akun pengguna dari sistem.
 * Fungsi ini hanya dapat diakses oleh admin.
 * @param {string} userId - ID pengguna yang akan dihapus.
 * @returns {Promise<Object>} Mengembalikan objek respons dari server.
 */
export const deleteUser = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'x-user-role': 'admin' }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menghapus pengguna.');
        }
        return await response.json();
    } catch (error) {
        console.error("Detail Eror di deleteUser:", error);
        throw error;
    }
};

/**
 * Mengubah peran (role) seorang pengguna, misalnya dari 'user' menjadi 'admin'.
 * Fungsi ini hanya dapat diakses oleh admin.
 * @param {string} userId - ID pengguna yang perannya akan diubah.
 * @param {string} newRole - Peran baru ('admin' atau 'user').
 * @returns {Promise<Object>} Mengembalikan objek respons dari server.
 */
export const updateUserRole = async (userId, newRole) => {
    try {
        // PASTIKAN ANDA MEMBUAT ENDPOINT INI DI BACKEND
        const response = await fetch(`${API_URL}/users/update-role`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': 'admin'
            },
            body: JSON.stringify({ userId, newRole })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mengubah peran pengguna.');
        }
        return await response.json();
    } catch (error) {
        console.error("Detail Eror di updateUserRole:", error);
        throw error;
    }
};

// --- FUNGSI UNTUK DASBOR & PERANGKAT ---

export const getDevices = async () => {
    try {
        const response = await fetch(`${API_URL}/devices`, {
            headers: { 'x-user-role': 'admin' }
        });
        if (!response.ok) throw new Error('Gagal mengambil data perangkat');
        return await response.json();
    } catch (error) {
        console.error("Error in getDevices:", error);
        throw error;
    }
};
export const disconnectDevice = async (sessionId) => {
    try {
        const response = await fetch(`${API_URL}/sessions/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 404) {
                throw new Error(errorData.message || 'Sesi sudah tidak aktif atau terputus.');
            }
            throw new Error(errorData.message || 'Gagal memutuskan koneksi.');
        }
        return await response.json();
    } catch (error) {
        console.error("Detail Eror di disconnectDevice:", error);
        throw error;
    }
};
export const updateWebhookUrl = async (userId, url) => {
    try {
        const response = await fetch(`${API_URL}/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, url })
        });
        if (!response.ok) throw new Error('Gagal memperbarui webhook');
        return await response.json();
    } catch (error) {
        console.error("Error in updateWebhookUrl:", error);
        throw error;
    }
};
export const getDashboardStats = async () => {
    // Di masa depan, ganti ini dengan panggilan fetch ke endpoint statistik Anda
    return Promise.resolve({
        sentCount: 10520,
        failedCount: 15,
        receivedCount: 8347,
        pendingCount: 5,
        contactCount: 1250,
    });
};

// --- FUNGSI UNTUK SESI & KONEKSI QR ---

export const initSession = async (sessionId) => {
    try {
        await fetch(`${API_URL}/sessions/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
    } catch (error) {
        console.error("Error in initSession:", error);
        throw error;
    }
};
export const getSessionStatus = async (sessionId) => {
    try {
        const response = await fetch(`${API_URL}/sessions/status/${sessionId}`);
        if (!response.ok) {
            if (response.status === 404) {
                return { isReady: false, qr: null, message: "Menginisialisasi sesi..." };
            }
            throw new Error('Gagal mengambil status sesi');
        }
        return await response.json();
    } catch (error) {
        console.error("Error in getSessionStatus:", error);
        throw error;
    }
};
