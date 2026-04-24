// routes/artworkRoutes.js
// This file defines the routes for handling artwork-related operations, such as creating, retrieving, updating, and deleting artworks.
// Author: Max Ceban
// Date: 24/04/2026

const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');

// CREATE a new artwork
router.post('/', async (req, res) => {
    const artwork = new Artwork(req.body);
    try{
        const savedArtwork = await artwork.save();
        res.status(201).json(savedArtwork);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// READ all artworks
router.get('/', async (req, res) => {
    try {
        // Implement pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;

        // Implement search functionality
        const search = req.query.search || '';

        // Calculate the skip value for pagination
        const skip = (page - 1) * limit;

        // Define the search query
        const query = {
            Title: { $regex: search, $options: 'i' } // Case-insensitive search on Title field
        };

        // Fetch artworks based on search query and pagination
        const artworks = await Artwork.find(query)
            .skip(skip)
            .limit(limit);

        const totalArtworks = await Artwork.countDocuments();

        res.json({
            artworks,
            currentPage: page,
            totalPages: Math.ceil(totalArtworks / limit),
            totalArtworks
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE an artwork by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedArtwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedArtwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }
        res.json(updatedArtwork);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE an artwork by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedArtwork = await Artwork.findByIdAndDelete(req.params.id);
        if (!deletedArtwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }
        res.json({ message: 'Artwork deleted' });
    } catch (err) {
        // Handle errors and send appropriate response
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
