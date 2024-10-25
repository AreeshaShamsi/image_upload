const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const morgan = require('morgan'); // HTTP request logger middleware

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Enable morgan for logging HTTP requests
app.use(morgan('dev'));

// PostgreSQL connection using DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Check PostgreSQL connection
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
    process.exit(1); // Exit the process if connection fails
  }
  console.log('Connected to PostgreSQL');
});

// Middleware to parse JSON bodies
app.use(express.json());

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.send('Hello, World!');
});

// Route to upload name and image
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    console.log('Upload request received:', { name, hasImage: !!imageBuffer });

    const query = 'INSERT INTO users (name, image) VALUES ($1, $2) RETURNING *';
    const values = [name, imageBuffer];

    const result = await pool.query(query, values);
    console.log('Data inserted:', result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting data:', error.message);
    res.status(500).json({ error: 'Failed to upload data', details: error.message });
  }
});

// Route to retrieve records
app.get('/records', async (req, res) => {
  try {
    console.log('Fetching records...');
    const query = 'SELECT id, name, image FROM users';
    const result = await pool.query(query);

    const records = result.rows.map((record) => ({
      id: record.id,
      name: record.name,
      image: record.image
        ? `data:image/jpeg;base64,${record.image.toString('base64')}`
        : null,
    }));

    console.log('Records fetched:', records);
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching records:', error.message);
    res.status(500).json({ error: 'Failed to fetch records', details: error.message });
  }
});

// Graceful shutdown to close the pool when exiting
process.on('exit', () => {
  console.log('Shutting down server...');
  pool.end(() => console.log('PostgreSQL pool has ended'));
});

// Catch uncaught exceptions and rejections to avoid server crash
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Exit on exception
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1); // Exit on promise rejection
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
