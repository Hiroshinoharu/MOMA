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
    try {
        const savedArtwork = await artwork.save();
        res.status(201).json(savedArtwork);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// READ all artworks
router.get('/', async (req, res) => {
    try {
        const artworks = await Artwork.find();
        res.json(artworks);
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
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;