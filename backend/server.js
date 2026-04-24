// Import the necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Configure environment variables from .env file
require("dotenv").config();


// Make the app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import and use the artwork routes
const artworkRoutes = require('./routes/artworkRoutes');
app.use('/api/artworks', artworkRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});