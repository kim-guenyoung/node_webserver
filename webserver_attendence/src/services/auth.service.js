import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function loginUser(email, password) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    throw new Error('User not found');
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error('Wrong password');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    accessToken: token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  };
}

export async function getMe(userId) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [userId]
  );
  return rows[0];
}
