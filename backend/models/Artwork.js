// Import the necessary modules
const mongoose = require('mongoose');

// Define the Artwork schema
const artworkSchema = new mongoose.Schema({
    Title: String,
    Artist: [String],
    ConstituentID: [Number],
    ArtistBio: [String],
    Nationality: [String],
    BeginDate: [Number],
    EndDate: [Number],
    Gender: [String],
    Date: String,
    Medium: String,
    Dimensions: String,
    CreditLine: String,
    AccessionNumber: String,
    Classification: String,
    Department: String,
    DateAcquired: String,
    Cataloged: String,
    ObjectID: Number,
    URL: String,
    ImageURL: String,
    OnView: String,
    "Height (cm)": Number,
    "Width (cm)": Number,
});

// Create the Artwork model from the schema and export it for use in other parts of the application
module.exports = mongoose.model('Artwork', artworkSchema);