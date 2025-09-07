const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

class User {
  static async create({ email, password, firstName, lastName }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, first_name, last_name, created_at`,
      [email, hashedPassword, firstName, lastName]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramCount} 
       RETURNING id, email, first_name, last_name, avatar_url`,
      values
    );

    return result.rows[0];
  }
}

module.exports = User;
