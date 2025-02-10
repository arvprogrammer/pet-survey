const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Basic Authentication Middleware
const basicAuth = (req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).send('Authentication required');
    }

    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const username = credentials[0];
    const password = credentials[1];

    if (username === 'admin' && password === 'Mr.free.66') {
        return next();
    } else {
        return res.status(403).send('Access denied');
    }
};

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.ico'));
});

app.get('/en', (req, res) => {
    res.sendFile(path.join(__dirname, 'form_en.html'));
});

app.get('/tr', (req, res) => {
    res.sendFile(path.join(__dirname, 'form_tr.html'));
});

app.get('/fa', (req, res) => {
    res.sendFile(path.join(__dirname, 'form_fa.html'));
});

app.get('/en/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'message_en.html'));
});

app.get('/tr/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'message_tr.html'));
});

app.get('/fa/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'message_fa.html'));
});

app.get('/result', basicAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'formData.json'));
});

// Handle form submission
app.post('/submit', (req, res) => {
    const formData = req.body;
    const filePath = path.join(__dirname, 'formData.json');

    // Read existing data, append new data, and save to file
    fs.readFile(filePath, (err, data) => {
        let jsonData = [];
        if (!err) {
            try {
                jsonData = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr);
            }
        }

        jsonData.push(formData);
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return res.status(500).send('Error saving data');
            }
            if (req.headers.referer?.indexOf('/en') > -1) {
                res.redirect('/en/success');
            } else if (req.headers.referer?.indexOf('/tr') > -1) {
                res.redirect('/tr/success');
            } else if (req.headers.referer?.indexOf('/fa') > -1) {
                res.redirect('/fa/success');
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
