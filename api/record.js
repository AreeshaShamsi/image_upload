const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  try {
    const query = 'SELECT id, name, image FROM user1';
    const result = await pool.query(query);

    // Convert image buffer to Base64
    const records = result.rows.map((record) => ({
      id: record.id,
      name: record.name,
      image: record.image
        ? `data:image/jpeg;base64,${record.image.toString('base64')}`
        : null,
    }));

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records', details: error.message });
  }
};
