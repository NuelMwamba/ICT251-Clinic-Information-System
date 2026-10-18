
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to the Health Clinic Info Page!');
});

// Test database connection and record count
app.get('/api/test-db', (req, res) => {
    db.get('SELECT COUNT(*) AS total FROM clinic', (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: 'Database connection successful',
            totalClinics: row.total
        });
    });
});

// GET all clinics
app.get('/api/clinic', (req, res) => {
    db.all('SELECT * FROM clinic ORDER BY id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// GET one clinic by ID
app.get('/api/clinic/:id', (req, res) => {
    db.get(
        'SELECT * FROM clinic WHERE id = ?',
        [req.params.id],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ error: 'Clinic not found' });
            }

            res.json(row);
        }
    );
});

// POST a new clinic
app.post('/api/clinic', (req, res) => {
    const {
        clinic_name,
        doctor_name,
        location,
        phone,
        email,
        services,
        opening_hours
    } = req.body;

    if (!clinic_name || !doctor_name || !location) {
        return res.status(400).json({
            error: 'Clinic name, doctor name, and location are required.'
        });
    }

    const sql = `
        INSERT INTO clinic
        (clinic_name, doctor_name, location, phone, email, services, opening_hours)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            clinic_name,
            doctor_name,
            location,
            phone || '',
            email || '',
            services || '',
            opening_hours || ''
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: 'Clinic created successfully',
                id: this.lastID
            });
        }
    );
});

// PUT: update a clinic
app.put('/api/clinic/:id', (req, res) => {
    const {
        clinic_name,
        doctor_name,
        location,
        phone,
        email,
        services,
        opening_hours
    } = req.body;

    if (!clinic_name || !doctor_name || !location) {
        return res.status(400).json({
            error: 'Clinic name, doctor name, and location are required.'
        });
    }

    const sql = `
        UPDATE clinic
        SET clinic_name = ?,
            doctor_name = ?,
            location = ?,
            phone = ?,
            email = ?,
            services = ?,
            opening_hours = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(
        sql,
        [
            clinic_name,
            doctor_name,
            location,
            phone || '',
            email || '',
            services || '',
            opening_hours || '',
            req.params.id
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Clinic not found' });
            }

            res.json({ message: 'Clinic updated successfully' });
        }
    );
});

// DELETE a clinic
app.delete('/api/clinic/:id', (req, res) => {
    db.run(
        'DELETE FROM clinic WHERE id = ?',
        [req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Clinic not found' });
            }

            res.json({ message: 'Clinic deleted successfully' });
        }
    );
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clinic API running on port ${PORT}`);
});
