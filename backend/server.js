require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.send('Trionda API is running...');
});

// Start server
async function startServer() {
  await db.connectDB();
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
}

startServer();
