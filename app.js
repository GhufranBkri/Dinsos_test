// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const employeeRoutes = require('./routes/employee');
require('dotenv').config();

const app = express();
const port = 'https://dinassosial.zeabur.app/';

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/employees', employeeRoutes);

// Root Endpoint (Optional)
app.post('/', (req, res) => {
    res.status(200).send('Root Endpoint POST Request');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});