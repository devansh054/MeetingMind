const { pool } = require('../config/database');

class Meeting {
  static async create({ title, description, hostId, scheduledStart, recordingEnabled = true, transcriptEnabled = true, aiInsightsEnabled = true }) {
    const result = await pool.query(
      `INSERT INTO meetings (title, description, host_id, scheduled_start, recording_enabled, transcript_enabled, ai_insights_enabled) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description, hostId, scheduledStart, recordingEnabled, transcriptEnabled, aiInsightsEnabled]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT m.*, u.first_name as host_first_name, u.last_name as host_last_name, u.email as host_email
       FROM meetings m
       JOIN users u ON m.host_id = u.id
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByHostId(hostId, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT m.*, 
       (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.id) as participant_count
       FROM meetings m
       WHERE m.host_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [hostId, limit, offset]
    );
    return result.rows;
  }

  static async updateStatus(id, status, additionalFields = {}) {
    const fields = ['status = $2'];
    const values = [id, status];
    let paramCount = 3;

    // Add timestamp fields based on status
    if (status === 'active' && !additionalFields.actual_start) {
      fields.push(`actual_start = NOW()`);
    }
    if (status === 'ended' && !additionalFields.actual_end) {
      fields.push(`actual_end = NOW()`);
    }

    // Add any additional fields - convert camelCase to snake_case for database
    Object.entries(additionalFields).forEach(([key, value]) => {
      // Convert camelCase to snake_case
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    const result = await pool.query(
      `UPDATE meetings SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async addParticipant(meetingId, { userId, displayName, email, role = 'participant' }) {
    const result = await pool.query(
      `INSERT INTO meeting_participants (meeting_id, user_id, display_name, email, role, joined_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [meetingId, userId, displayName, email, role]
    );
    
    return result.rows[0];
  }

  static async getParticipants(meetingId) {
    const result = await pool.query(
      `SELECT mp.*, u.avatar_url
       FROM meeting_participants mp
       LEFT JOIN users u ON mp.user_id = u.id
       WHERE mp.meeting_id = $1
       ORDER BY mp.joined_at ASC`,
      [meetingId]
    );
    return result.rows;
  }

  static async removeParticipant(meetingId, participantId) {
    const result = await pool.query(
      `UPDATE meeting_participants 
       SET left_at = NOW() 
       WHERE meeting_id = $1 AND id = $2 
       RETURNING *`,
      [meetingId, participantId]
    );
    
    return result.rows[0];
  }

  static async delete(id, hostId) {
    const result = await pool.query(
      'DELETE FROM meetings WHERE id = $1 AND host_id = $2 RETURNING *',
      [id, hostId]
    );
    return result.rows[0];
  }
}

module.exports = Meeting;
