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

app.get('/about', (req, res) => {
    res.type('html').send(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>About this page - MoMA Catalogue</title>
    <style>
      body {
        margin: 0;
        background: #f7f4ef;
        color: #14110f;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(960px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0;
      }
      h1 {
        max-width: 760px;
        margin: 0 0 18px;
        font-size: clamp(42px, 7vw, 72px);
        line-height: 0.98;
      }
      h2 {
        margin: 0 0 10px;
        font-size: 24px;
      }
      p, li {
        color: #716b65;
        font-size: 18px;
        line-height: 1.5;
      }
      section {
        margin-top: 22px;
        padding: 22px;
        border: 1px solid #ded8cf;
        border-radius: 8px;
        background: #fffdf9;
      }
      a {
        color: #bf2c26;
        font-weight: 800;
      }
      .eyebrow {
        color: #bf2c26;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">About this page</p>
      <h1>MoMA Art Catalogue</h1>
      <p>
        This application is a full-stack artwork catalogue. A React and Vite frontend
        communicates with a Node.js and Express backend through REST endpoints. Artwork
        records are stored in a local MongoDB database.
      </p>

      <section>
        <h2>How the application works</h2>
        <p>
          The browser sends HTTP requests to the Express API. The API queries MongoDB,
          returns paginated JSON data, and supports creating, updating, deleting,
          searching, and filtering artwork records.
        </p>
      </section>

      <section>
        <h2>Technologies used</h2>
        <ul>
          <li>React with Vite for the frontend interface.</li>
          <li>Axios for HTTP requests from the client.</li>
          <li>Node.js and Express for REST services.</li>
          <li>MongoDB and Mongoose for database storage and queries.</li>
        </ul>
      </section>

      <section>
        <h2>Limitations</h2>
        <p>
          The app currently uses simple browser confirmation for delete actions, no user
          accounts, and basic text matching. Search and filtering work, but more advanced
          indexing would improve performance with larger datasets.
        </p>
      </section>

      <section>
        <h2>Alternative approaches</h2>
        <p>
          The same project could be built with Next.js, server-side rendering, a hosted
          MongoDB Atlas database, or separate microservices for artwork records, users,
          and orders.
        </p>
      </section>

      <p><a href="http://localhost:5173">Return to the catalogue</a></p>
    </main>
  </body>
</html>
    `);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
