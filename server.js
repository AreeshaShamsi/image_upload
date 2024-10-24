const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000; // Port for the Express server

// Enable CORS
app.use(cors());

// PostgreSQL Pool Configuration
const pool = new Pool({
    user: 'postgres',          // PostgreSQL user
    host: 'localhost',       // Host where PostgreSQL is running
    database: 'second',      // Database name
    password: '0000',       // Password for the PostgreSQL user
    port: 5432,              // Default PostgreSQL port
});

// Middleware to parse JSON bodies
app.use(express.json());

/// Configure Multer for File Uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage }); // Create multer instance

// Route to Upload Name and Image
app.post('/upload', upload.single('image'), async (req, res) => {
    const { name } = req.body; // Expecting JSON body with only name
    const imageBuffer = req.file ? req.file.buffer : null; // Get image buffer

    try {
        const query = 'INSERT INTO user1 (name, image) VALUES ($1, $2) RETURNING *';
        const values = [name, imageBuffer]; // Include image buffer

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]); // Respond with the inserted row
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Failed to upload data', details: error.message });
    }
});

// Route to Retrieve Records
// Route to Retrieve Records
app.get('/records', async (req, res) => {
    try {
        const query = 'SELECT id, name, image FROM user1'; // Fetch id, name, and image
        const result = await pool.query(query);
        // Convert images to Base64 format
        const recordsWithBase64Images = result.rows.map(record => ({
            id: record.id,
            name: record.name,
            image: record.image ? `data:image/jpeg;base64,${record.image.toString('base64')}` : null // Convert to Base64
        }));
        res.status(200).json(recordsWithBase64Images); // Respond with the modified records
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records', details: error.message });
    }
});

// Graceful shutdown to close the pool when exiting
process.on('exit', () => {
    pool.end();
});

// Server Setup
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
