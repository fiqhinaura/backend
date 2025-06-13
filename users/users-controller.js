import Users from './user-model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'nik', 'tanggalLahir', 'domisili', 'role'],
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const Register = async (req, res) => {
    const { name, nik, tanggalLahir, domisili, password, confPassword } = req.body;
    const fotoKtp = req.file ? req.file.filename : null;

    // Validasi field wajib
    if (!name || !nik || !tanggalLahir || !domisili || !password || !confPassword || !fotoKtp) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Validasi password dan konfirmasi
    if (password !== confPassword) {
        return res.status(400).json({ message: 'Password dan konfirmasi password tidak sama' });
    }

    try {
        // Cek NIK sudah terdaftar
        const existingUser = await Users.findOne({ where: { nik } });
        if (existingUser) {
            return res.status(400).json({ message: 'NIK already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await Users.create({
            name,
            nik,
            tanggalLahir,
            domisili,
            fotoKtp, // simpan nama file
            password: hashedPassword
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const Login = async (req, res) => {
    try {
        const { nik, password } = req.body;
        if (!nik || !password) {
            return res.status(400).json({ message: 'NIK dan password wajib diisi' });
        }

        const user = await Users.findOne({
            where: { nik }
        });

        if (!user) {
            return res.status(404).json({ message: 'NIK tidak ditemukan' });
        }

        if (!user.password) {
            return res.status(400).json({ message: 'Password belum diset untuk user ini' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Password salah' });

        const userId = user.id;
        const name = user.name;
        const role = user.role;
        const accsessToken = jwt.sign({ userId, name, nik, role }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s'
        });
        const refreshToken = jwt.sign({ userId, name, nik, role }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        await Users.update({ refreshToken: refreshToken }, {
            where: { id: userId }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ accsessToken, role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where: {
            refreshToken: refreshToken
        }
    });
    if (!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({ refreshToken: null }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    res.sendStatus(200);
}

// backend/users/users-controller.js
export const getMe = async (req, res) => {
  const user = await Users.findByPk(req.userId); // pastikan req.userId diisi oleh middleware auth
  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
  res.json(user);
};