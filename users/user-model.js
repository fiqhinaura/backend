import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const User = db.define('users', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nik: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [16, 16],
                msg: "NIK harus terdiri dari 16 angka"
            },
            isNumeric: {
                msg: "NIK hanya boleh berisi angka"
            }
        }
    },
    tanggalLahir: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    domisili: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fotoKtp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('pasien', 'admin', 'dokter'),
        allowNull: false,
        defaultValue: 'pasien'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    freezeTableName: true,
});

export default User;