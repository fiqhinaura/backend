import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Antrian from "../antrian/antrian-model.js";

const Feedback = db.define('feedback', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  antrianId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Antrian,
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER, // 1-5
    allowNull: false
  },
  komentar: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  freezeTableName: true,
  timestamps: true // createdAt & updatedAt
});

// Relasi: Feedback milik satu antrian
Feedback.belongsTo(Antrian, { foreignKey: 'antrianId' });

export default Feedback;