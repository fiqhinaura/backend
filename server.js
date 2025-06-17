// server.js
// hilangkan semua komentar (di on kan) untuk create tabel di database

import express from 'express';
import db from './config/database.js';
import router from './routes/index.js'; // Pastikan ini mengarah ke file routes utama Anda
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Antrian from './antrian/antrian-model.js'; //idupkan ini jika ingin membuat tabel antrian
import Users from './users/user-model.js'; //idupkan ini jika ingin membuat tabel users
import Feedback from './feedback/feedback-model.js';
// PERBAIKAN FINAL: Menggunakan sintaks import untuk modul fs dan path
// Ini adalah cara yang benar untuk ES Modules
import fs from 'fs';
import path from 'path';

dotenv.config();
const app = express();

// Fungsi untuk membuat direktori jika belum ada
const createUploadsDirectory = () => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'ktp');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Direktori "${uploadDir}" berhasil dibuat.`);
    } else {
        console.log(`Direktori "${uploadDir}" sudah ada.`);
    }
};

try {
    await db.authenticate();
    console.log('Database connected');
    // Panggil fungsi untuk membuat direktori uploads saat startup
    createUploadsDirectory(); // Panggil di sini

    // Sinkronisasi tabel (pastikan hanya dijalankan di development atau dengan migrasi yang tepat di production)
    // await db.sync();
    await Users.sync();
    await Antrian.sync();
    await Feedback.sync();
} catch (error) {
    console.log('Database connection error:', error); // Logging yang lebih spesifik
}

// Tambahkan URL deploy frontend Anda ke daftar origin CORS
app.use(cors({
    origin: [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://frontend-pusque-nine.vercel.app',
        'https://dicoding-story-app-9hgv.vercel.app'
    ],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
// Pastikan path statis mengarah ke folder 'uploads' utama
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); 
app.use(router); // Menggunakan router utama
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
