// seed.js allows us to populate our database with initial data. This is useful for testing and development purposes.

const mongoose = require('mongoose');
const Artwork = require('./models/Artwork'); // Import the Artwork model
const data = require('../data/Artworks.json'); // Import the JSON data

// Set up environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
  return Artwork.deleteMany({}); // Clear existing data
})
.then(() => {
  console.log('Existing artworks cleared');
  return Artwork.insertMany(data); // Insert new data from JSON file
})
.then(() => {
  console.log('Database seeded successfully');
  mongoose.disconnect(); // Disconnect from MongoDB
})
.catch((error) => {
  console.error('Error seeding database:', error);
});