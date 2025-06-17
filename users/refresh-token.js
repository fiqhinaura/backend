// refresf-token.js
import Users from '../users/user-model.js'; // Pastikan path ke model user sudah benar
import jwt from 'jsonwebtoken';

/**
 * Endpoint untuk me-refresh Access Token menggunakan Refresh Token yang ada di cookie.
 * @param {object} req - Objek request Express, diharapkan memiliki cookie 'refreshToken'.
 * @param {object} res - Objek response Express.
 */
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        // Jika Refresh Token tidak ada di cookie, kembalikan 401 Unauthorized.
        if (!refreshToken) {
            console.warn("[refreshToken] Refresh Token tidak ditemukan di cookies. Mengirim 401.");
            return res.sendStatus(401);
        }

        // Cari pengguna berdasarkan Refresh Token yang tersimpan di database.
        const user = await Users.findAll({ 
            where: { 
                refreshToken: refreshToken
            },
            // Hanya ambil kolom yang diperlukan untuk keamanan dan efisiensi
            attributes: ['id', 'name', 'nik', 'role'] // Pastikan 'role' ada di sini jika Anda ingin menyertakannya di Access Token
        });
        
        // Jika pengguna tidak ditemukan atau Refresh Token tidak cocok dengan pengguna manapun.
        if (!user || user.length === 0 || !user[0]) {
            console.warn("[refreshToken] User tidak ditemukan untuk Refresh Token ini. Mengirim 403.");
            return res.sendStatus(403); // Forbidden, karena Refresh Token tidak valid/tidak cocok
        }

        // Verifikasi Refresh Token menggunakan REFRESH_TOKEN_SECRET.
        // Jika verifikasi gagal (token tidak valid, kadaluarsa, diubah).
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.error("[refreshToken] Verifikasi Refresh Token GAGAL:", err.message);
                // Mengembalikan 403 Forbidden jika Refresh Token tidak valid.
                return res.sendStatus(403);
            }

            // Opsional: Anda bisa menambahkan verifikasi tambahan di sini
            // misalnya: if (decoded.userId !== user[0].id) { return res.sendStatus(403); }

            // Ambil data pengguna yang diperlukan untuk Access Token baru.
            const userId = user[0].id;
            const name = user[0].name;
            const nik = user[0].nik;
            const role = user[0].role; // Ambil role dari data user

            // Buat Access Token baru dengan masa berlaku yang lebih realistis.
            const accessToken = jwt.sign(
                { userId, name, nik, role }, // Sertakan role di payload Access Token
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1d' } // <-- PERUBAHAN PENTING DI SINI! (misal: 15 menit atau '1h' untuk 1 jam)
            );

            // Kirim Access Token baru sebagai respons JSON.
            res.json({ accessToken });
        });
    } catch (error) {
        // Tangani error umum server.
        console.error('[refreshToken] Error handler caught:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
