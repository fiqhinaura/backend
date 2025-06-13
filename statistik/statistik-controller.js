import { Op } from "sequelize";
import Users from "../users/user-model.js"; // Pastikan model Users sudah benar

// Misal di atas fungsi atau di dalam fungsi getPasienPerBulan
const bulanArr = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const getPasienPerBulan = async (req, res) => {
  try {
    // Ambil tahun dan bulan dari query, default tahun dan bulan sekarang
    const tahun = req.query.tahun || new Date().getFullYear();
    const bulan = req.query.bulan || (new Date().getMonth() + 1);

    // Validasi tanggal
    const startDate = new Date(`${tahun}-${bulan.toString().padStart(2, '0')}-01`);
    const endDate = new Date(`${tahun}-${bulan.toString().padStart(2, '0')}-31`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Tanggal tidak valid" });
    }

    // Query jumlah user per bulan
    const jumlah = await Users.count({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      }
    });

    res.json([{ bulan: bulanArr[bulan - 1], jumlah }]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};