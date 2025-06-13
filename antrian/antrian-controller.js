import Antrian from "./antrian-model.js";
import Users from "../users/user-model.js";
import sequelize from "sequelize";
import { Op } from "sequelize";

// Buat antrian baru
export const createAntrian = async (req, res) => {
  try {
    const { keluhan, poli } = req.body;
    const userId = req.userId; 

    if (!keluhan || !poli) {
      return res.status(400).json({ message: "Keluhan dan poli wajib diisi" });
    }

    // Pastikan user ada
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Buat antrian baru, status otomatis 'menunggu acc admin'
    const antrian = await Antrian.create({
      keluhan,
      poli,
      userId
    });

    res.status(201).json({ message: "Antrian berhasil dibuat", antrian });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin ACC antrian
export const accAntrian = async (req, res) => {
  const { id } = req.params;
  const antrian = await Antrian.findByPk(id);
  if (!antrian) return res.status(404).json({ message: "Antrian tidak ditemukan" });
  if (antrian.status !== 'menunggu acc admin') return res.status(400).json({ message: "Antrian sudah diproses" });

  // Cari queue_number terbesar untuk poli yang sama
  const maxQueue = await Antrian.max('queue_number', {
    where: { poli: antrian.poli, status: 'dalam antrian' }
  });
  antrian.status = 'dalam antrian';
  antrian.queue_number = (maxQueue || 0) + 1;
  await antrian.save();
  res.json({ message: "Antrian di-ACC, masuk dalam antrian", antrian });
};

// Admin menurnkan antrian
export const mundurkanAntrian = async (req, res) => {
  try {
    const { id } = req.params;
    const antrian = await Antrian.findByPk(id);
    if (!antrian) return res.status(404).json({ message: "Antrian tidak ditemukan" });
    if (antrian.status !== 'dalam antrian') return res.status(400).json({ message: "Antrian tidak dalam status 'dalam antrian'" });

    // Cari antrian berikutnya di poli yang sama
    const nextAntrian = await Antrian.findOne({
      where: {
        poli: antrian.poli,
        status: 'dalam antrian',
        queue_number: antrian.queue_number + 1
      }
    });

    if (!nextAntrian) return res.status(400).json({ message: "Tidak bisa diturunkan lagi (sudah paling bawah)" });

    // Tukar queue_number
    const temp = antrian.queue_number;
    antrian.queue_number = nextAntrian.queue_number;
    nextAntrian.queue_number = temp;

    await antrian.save();
    await nextAntrian.save();

    res.json({ message: "Antrian berhasil diturunkan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin tolak antrian
export const tolakAntrian = async (req, res) => {
  const { id } = req.params;
  const antrian = await Antrian.findByPk(id);
  if (!antrian) return res.status(404).json({ message: "Antrian tidak ditemukan" });
  if (antrian.status !== 'menunggu acc admin') return res.status(400).json({ message: "Antrian sudah diproses" });
  antrian.status = 'ditolak';
  await antrian.save();
  res.json({ message: "Antrian ditolak", antrian });
};

// Dokter update status antrian ke selesai
export const selesaiAntrian = async (req, res) => {
  const { id } = req.params;
  const antrian = await Antrian.findByPk(id);
  if (!antrian) return res.status(404).json({ message: "Antrian tidak ditemukan" });
  if (antrian.status !== 'dalam antrian') return res.status(400).json({ message: "Antrian belum di-ACC admin atau sudah selesai/ditolak" });

  const currentQueue = antrian.queue_number;
  const currentPoli = antrian.poli;

  antrian.status = 'selesai';
  await antrian.save();

  // mengubah queue_number antrian berikutnya
  await Antrian.update(
    { queue_number: sequelize.literal('queue_number - 1') },
    {
      where: {
        poli: currentPoli,
        status: 'dalam antrian',
        queue_number: { [Op.gt]: currentQueue }
      }
    }
  );

  res.json({ message: "Antrian selesai", antrian });
};

// Admin ambil semua antrian
export const getAllAntrian = async (req, res) => {
  const antrian = await Antrian.findAll({
    include: [{ model: Users, attributes: ['name', 'nik', 'role'] }],
    order: [['queue_number', 'ASC']]
  });
  res.json(antrian);
};

// Detail antrian 
export const getAntrianById = async (req, res) => {
  const { id } = req.params;
  const antrian = await Antrian.findByPk(id, {
    include: [{ model: Users, attributes: ['name', 'nik', 'tanggalLahir', 'fotoKtp'] }]
  });
  if (!antrian) return res.status(404).json({ message: "Antrian tidak ditemukan" });
  res.json(antrian);
};

// Kembalikan antrian (hanya untuk admin)
export const kembalikanAntrian = async (req, res) => {
  try {
    const id = req.params.id;
    await Antrian.update(
      { status: 'menunggu acc admin' },
      { where: { id } }
    );
    res.json({ message: 'Antrian berhasil dikembalikan ke menunggu acc admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hapus antrian (hanya untuk admin)
export const deleteAntrian = async (req, res) => {
  try {
    const id = req.params.id;
    await Antrian.destroy({ where: { id } });
    res.json({ message: 'Antrian berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAntrianUser = async (req, res) => {
  try {
    console.log('userId dari token:', req.userId);
    const antrian = await Antrian.findOne({
      where: { userId: req.userId, status: 'dalam antrian' }
    });
    if (!antrian) return res.status(404).json({ message: "Antrian tidak ditemukan" });
    res.json(antrian);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const simpanPrediksiAntrian = async (req, res) => {
  const { id } = req.params;
  const { entryMinutes, durationMinutes } = req.body;

  try {
    const antrian = await Antrian.findByPk(id);
    if (!antrian) return res.status(404).json({ message: "Antrian tidak ditemukan" });

    antrian.estimasi_masuk = entryMinutes;
    antrian.durasi_periksa = durationMinutes;

    await antrian.save();

    res.json({ message: "Prediksi berhasil disimpan", antrian });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan prediksi" });
  }
};
