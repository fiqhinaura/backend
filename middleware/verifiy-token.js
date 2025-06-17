// verify-token.js
import jwt from 'jsonwebtoken';

/**
 * Middleware untuk memverifikasi Access Token dari header Authorization.
 * Ini memastikan bahwa hanya request yang memiliki Access Token valid yang dapat melanjutkan.
 *
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 * @param {function} next - Fungsi callback untuk melanjutkan ke middleware/route berikutnya.
 */
export const verifyToken = (req, res, next) => {
    // Ambil Access Token dari header Authorization (format: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1]; // Mengambil bagian token setelah 'Bearer '

    // Jika Access Token tidak ada di header, kembalikan 401 Unauthorized.
    // Ini menunjukkan bahwa request tidak memiliki otentikasi.
    if (!accessToken) {
        console.warn("[verifyToken] Access Token tidak ditemukan di header Authorization. Mengirim 401.");
        return res.sendStatus(401);
    }

    // Verifikasi Access Token menggunakan ACCESS_TOKEN_SECRET.
    // Jika token tidak valid (misal: kadaluarsa, signature tidak cocok, malformed).
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            // Log error verifikasi token untuk debugging.
            console.error("[verifyToken] Verifikasi Access Token GAGAL:", err.message);
            // Mengembalikan 403 Forbidden jika token ada tapi tidak valid.
            // Ini menunjukkan bahwa pengguna mencoba akses dengan token yang tidak berhak/tidak valid.
            return res.sendStatus(403);
        }

        // Jika verifikasi berhasil, tambahkan informasi pengguna dari payload token
        // ke objek request, agar dapat diakses oleh route handler berikutnya.
        req.userId = decoded.userId;
        req.role = decoded.role; // Asumsi 'role' ada di payload token Anda
        next(); // Lanjutkan ke middleware atau route handler berikutnya
    });
};
