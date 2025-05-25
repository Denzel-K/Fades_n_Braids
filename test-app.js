const express = require('express');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test route with parameter
app.get('/test/:id', (req, res) => {
  res.json({ id: req.params.id });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

module.exports = app;
