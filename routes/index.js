import express from 'express';
import multer from 'multer';
import { getUsers, Register, Login, Logout, getMe } from '../users/users-controller.js';
import { verifyToken } from '../middleware/verifiy-token.js';
import { refreshToken } from '../users/refresh-token.js';
import { getAllAntrian } from '../antrian/antrian-controller.js';
import { createAntrian, accAntrian, tolakAntrian, selesaiAntrian } from '../antrian/antrian-controller.js';
import { getAntrianById } from '../antrian/antrian-controller.js';
import { kembalikanAntrian } from '../antrian/antrian-controller.js';
import { deleteAntrian } from '../antrian/antrian-controller.js';
import { mundurkanAntrian } from '../antrian/antrian-controller.js';
import { getAntrianUser } from '../antrian/antrian-controller.js';
import { simpanPrediksiAntrian } from '../antrian/antrian-controller.js';
import { getPasienPerBulan } from '../statistik/statistik-controller.js';
import { getUserFeedback, createFeedback, getRiwayatAntrianSelesai } from '../feedback/feedback-controller.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/ktp/');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, req.body.nik + '.' + ext);
  }
});
const upload = multer({ storage: storage });

// User routes
router.get('/users', verifyToken, getUsers);
router.post('/users', upload.single('fotoKtp'), Register);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);
router.get('/user/me', verifyToken, getMe); 

// Statistik routes
router.get('/statistik/pasien-per-bulan', verifyToken, getPasienPerBulan);

// Antrian routes
router.get('/antrian', verifyToken, getAllAntrian);
router.post('/antrian', verifyToken, createAntrian);
router.patch('/antrian/:id/acc', verifyToken, accAntrian);
router.patch('/antrian/:id/tolak', verifyToken, tolakAntrian);
router.patch('/antrian/:id/selesai', verifyToken, selesaiAntrian);
router.patch('/antrian/:id/kembalikan', verifyToken, kembalikanAntrian);
router.delete('/antrian/:id', verifyToken, deleteAntrian);
router.get('/antrian/user', verifyToken, getAntrianUser);
router.get('/antrian/riwayat', verifyToken, getRiwayatAntrianSelesai);
router.get('/antrian/:id', verifyToken, getAntrianById);
router.patch('/antrian/:id/mundur', verifyToken, mundurkanAntrian);
router.patch('/antrian/:id/prediksi', verifyToken, simpanPrediksiAntrian);

// Feedback routes
router.get('/feedback/user', verifyToken, getUserFeedback);
router.post('/feedback', verifyToken, createFeedback);

export default router;