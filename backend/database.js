
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'clinic.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to the clinic database.');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS clinic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clinic_name TEXT NOT NULL,
            doctor_name TEXT NOT NULL,
            location TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            services TEXT,
            opening_hours TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Table creation failed:', err.message);
            return;
        }

        console.log('Clinic table created successfully.');

        db.get('SELECT COUNT(*) AS total FROM clinic', (err, row) => {
            if (err) {
                console.error('Could not count clinics:', err.message);
                return;
            }

            if (row.total === 0) {
                const insert = db.prepare(`
                    INSERT INTO clinic
                    (clinic_name, doctor_name, location, phone, email, services, opening_hours)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                insert.run(
                    'Community Health Clinic',
                    'Dr Banda',
                    'Lusaka',
                    '0977000001',
                    'community@example.com',
                    'General consultation',
                    '08:00 - 17:00'
                );

                insert.run(
                    'Lusaka Family Clinic',
                    'Dr Phiri',
                    'Lusaka',
                    '0977000002',
                    'family@example.com',
                    'Family medicine',
                    '08:00 - 18:00'
                );

                insert.run(
                    'Hope Medical Centre',
                    'Dr Mwansa',
                    'Kitwe',
                    '0977000003',
                    'hope@example.com',
                    'General healthcare',
                    '09:00 - 16:00'
                );

                insert.finalize((err) => {
                    if (err) {
                        console.error('Sample data insertion failed:', err.message);
                    } else {
                        console.log('Three sample clinic records inserted.');
                    }
                });
            } else {
                console.log(`Database already contains ${row.total} clinic records.`);
            }
        });
    });
});

module.exports = db;
