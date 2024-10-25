const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');

require('dotenv').config();

const app = express();
// Use PORT from environment variables
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// PostgreSQL connection using the DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})


pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
    return;
  }
  console.log('Connected to PostgreSQL');
})
// Middleware to parse JSON bodies
app.use(express.json());

// // Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// // Route to upload name and image
app.post('/upload', upload.single('image'), async (req, res) => {
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

// // Route to retrieve records
app.get('/records', async (req, res) => {
  try {
    const query = 'SELECT id, name, image FROM user1';
    const result = await pool.query(query);

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
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
