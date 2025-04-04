const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'Arko',
    password: 'Arko',
    database: 'your_database'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.get('/data', (req, res) => {
    connection.query('SELECT * FROM my_table', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});