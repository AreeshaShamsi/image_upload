const { Pool } = require('pg');
const multer = require('multer');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use environment variable
  ssl: { rejectUnauthorized: false }, // Required for some PostgreSQL providers
});

// Multer configuration to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = async (req, res) => {
  // Use Multer to handle file uploads
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Upload failed', details: err.message });
    }

    const { name } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    try {
      const query = 'INSERT INTO user1 (name, image) VALUES ($1, $2) RETURNING *';
      const values = [name, imageBuffer];
      const result = await pool.query(query, values);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to upload data', details: error.message });
    }
  });
};
