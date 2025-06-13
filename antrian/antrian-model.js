import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Users from "../users/user-model.js";

const Antrian = db.define('antrian', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  poli: {
    type: DataTypes.ENUM('umum', 'gigi', 'anak', 'kandungan'),
    allowNull: false
  },
  keluhan: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('menunggu acc admin', 'dalam antrian', 'selesai', 'ditolak'),
    allowNull: false,
    defaultValue: 'menunggu acc admin'
  },
  queue_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  estimasi_masuk: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  durasi_periksa: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  
}, {
  freezeTableName: true,
  timestamps: true // createdAt & updatedAt
});

// Relasi: Satu user bisa punya banyak antrian
Antrian.belongsTo(Users, { foreignKey: 'userId' });

export default Antrian;