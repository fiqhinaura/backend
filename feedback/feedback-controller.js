import Feedback from "./feedback-model.js";
import Antrian from "../antrian/antrian-model.js";

// Ambil semua feedback milik user yang sedang login
export const getUserFeedback = async (req, res) => {
  try {
    // Ambil userId dari token (diasumsikan sudah ada di req.userId)
    const feedbacks = await Feedback.findAll({
      include: [{
        model: Antrian,
        where: { userId: req.userId }
      }]
    });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Simpan feedback baru
export const createFeedback = async (req, res) => {
  try {
    const { antrianId, rating, komentar } = req.body;
    // Cek apakah antrian milik user dan statusnya selesai
    const antrian = await Antrian.findOne({
      where: { id: antrianId, userId: req.userId, status: "selesai" }
    });
    if (!antrian) return res.status(403).json({ message: "Antrian tidak valid atau belum selesai" });

    // Cek apakah sudah pernah feedback untuk antrian ini
    const existing = await Feedback.findOne({ where: { antrianId } });
    if (existing) return res.status(400).json({ message: "Feedback sudah pernah diberikan" });

    const feedback = await Feedback.create({ antrianId, rating, komentar });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// (Opsional) Ambil riwayat antrian selesai milik user (untuk halaman feedback)
export const getRiwayatAntrianSelesai = async (req, res) => {
  try {
    const riwayat = await Antrian.findAll({
      where: { userId: req.userId, status: "selesai" },
      order: [["updatedAt", "DESC"]]
    });
    res.json(riwayat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};