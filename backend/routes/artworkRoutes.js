// routes/artworkRoutes.js
// This file defines the routes for handling artwork-related operations, such as creating, retrieving, updating, and deleting artworks.
// Author: Max Ceban
// Date: 24/04/2026

const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');

// Shared validation keeps create and update requests consistent.
const validateArtwork = (body) => {
    const errors = [];

    if (!body.Title?.trim?.()) {
        errors.push('Title is required');
    }

    const hasArtistArray = Array.isArray(body.Artist) && body.Artist.some((artist) => String(artist).trim());
    const hasArtistString = typeof body.Artist === 'string' && body.Artist.trim();
    if (!hasArtistArray && !hasArtistString) {
        errors.push('Artist is required');
    }

    if (!body.Date || !String(body.Date).trim()) {
        errors.push('Date is required');
    }

    if (!body.Medium?.trim?.()) {
        errors.push('Medium is required');
    }

    if (body.ImageURL && !/^https?:\/\/.+/i.test(body.ImageURL)) {
        errors.push('Image URL must start with http:// or https://');
    }

    return errors;
};

// Whitelist allowed sort modes so query params cannot sort by arbitrary fields.
const sortOptions = {
    'title-asc': { Title: 1 },
    'title-desc': { Title: -1 },
    'date-asc': { Date: 1 },
    'date-desc': { Date: -1 },
    'artist-asc': { Artist: 1 },
};

// CREATE a new artwork to add to the database
router.post('/', async (req, res) => {
    const errors = validateArtwork(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(', ') });
    }

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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        // Implement search functionality
        const search = req.query.search || '';

        // Classification filter (optional)
        const classification = req.query.classification || '';

        // Empty sort keeps MongoDB's default order; known values apply explicit ordering.
        const sort = sortOptions[req.query.sort] || {};

        // Calculate the skip value for pagination
        const skip = (page - 1) * limit;

        let query = {};

        // Add search criteria to the query if search term is provided
        if (search) {
            query.$or = [
                { Title: { $regex: search, $options: 'i' } },
                { Medium: { $regex: search, $options: 'i' } },
                { Artist: { $regex: search, $options: 'i' } }
            ];
        }

        // Add classification filter to the query if provided
        if (classification) {
            query.Classification = classification;
        }

        // Fetch artworks based on search query and pagination
        const artworks = await Artwork.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Calculate total number of artworks matching the query for pagination
        const totalArtworks = await Artwork.countDocuments(query);

        // Send the response
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
    const errors = validateArtwork(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(', ') });
    }

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
        res.json({ message: 'Artwork deleted successfully' });
    } catch (err) {
        // Handle errors and send appropriate response
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
