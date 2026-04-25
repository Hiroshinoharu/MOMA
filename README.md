# MoMA Art Catalogue

Full-stack artwork catalogue built with React, Vite, Node.js, Express, MongoDB, and Mongoose.

## Features

- Browse MoMA artwork records from MongoDB
- Server-side search
- Classification filtering
- Pagination for large datasets
- Add artwork records
- Edit artwork records
- Delete artwork records
- Backend-served About page at `http://localhost:5050/about`

## Requirements

- Node.js
- npm
- Local MongoDB running on port `27017`

## Install

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Environment

Create `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/moma
PORT=5050
```

## Seed the Database

Before running the app for the first time, seed MongoDB with the MoMA artwork data.

Make sure the large dataset file exists locally at:

```text
data/Artworks.json
```

This file is not committed to GitHub because it is larger than GitHub's file size limit.

Start MongoDB, then run the seed file from the backend folder:

```bash
cd backend
node seed.js
```

The seed script connects to the database from `MONGODB_URI`, clears the existing artwork records, and imports the records from `data/Artworks.json`.

## Run

Start MongoDB first.

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open the frontend:

```text
http://localhost:5173
```

Open the backend About page:

```text
http://localhost:5050/about
```

## Dataset

The app uses MoMA artwork data imported into MongoDB. The large source file `data/Artworks.json` is ignored by Git because it exceeds GitHub's file size limit, so it must be kept locally and seeded before the catalogue will show records.
