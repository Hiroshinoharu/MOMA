import axios from 'axios';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State for artworks, pagination, loading status, and error messages
  const [artworks, setArtworks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch artworks from the backend API when the component mounts or when currentPage or search changes
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/artworks?page=${currentPage}&limit=20&search=${search}`);
        
        // Ensure that response.data.artworks is an array before setting state
        setArtworks(Array.isArray(response.data.artworks) ? response.data.artworks : []);
        setCurrentPage(response.data.currentPage || currentPage);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        // Handle errors and set error message
        console.error('Error fetching artworks:', error);
        setError('Could not load artworks');
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [currentPage, search]);

  const formatArtist = (artist) => {
    if (Array.isArray(artist)) {
      return artist.filter(Boolean).join(', ');
    }

    return artist || 'Unknown artist';
  };

  return (
    <main className="catalogue-shell">
      <section className="catalogue-hero">
        <div>
          <p className="eyebrow">Museum collection</p>
          <h1>MoMA Art Catalogue</h1>
          <p className="hero-copy">
            Browse works from the collection loaded from the backend API.
          </p>
        </div>
      </section>

      <section className="search-bar" aria-label="Search artworks">
        <label className="search-field">
          <span>Search the collection</span>
          <input
            type="search"
            placeholder="Search by title, artist, medium..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </label>

        {search && (
          <button
            className="clear-search"
            type="button"
            onClick={() => {
              setSearch('');
              setCurrentPage(1);
            }}
          >
            Clear
          </button>
        )}
      </section>

      {loading && <p className="status-message">Loading artworks...</p>}
      {error && <p className="status-message error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="results-bar">
            <p>
              Showing <strong>{artworks.length}</strong> artworks on page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>.
            </p>
          </div>

          <section className="artwork-grid" aria-label="Artwork results">
            {artworks.map((artwork) => (
              <article className="artwork-card" key={artwork._id || artwork.ObjectID}>
                <div className="artwork-image">
                  {artwork.ImageURL ? (
                    <img src={artwork.ImageURL} alt={artwork.Title || 'Artwork'} />
                  ) : (
                    <span>No image</span>
                  )}
                </div>

                <div className="artwork-content">
                  <p className="department">{artwork.Department || 'Collection'}</p>
                  <h2>{artwork.Title || 'Untitled'}</h2>
                  <p className="artist">{formatArtist(artwork.Artist)}</p>
                  <dl>
                    <div>
                      <dt>Date</dt>
                      <dd>{artwork.Date || 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt>Medium</dt>
                      <dd>{artwork.Medium || 'Not listed'}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </section>

          {artworks.length === 0 && (
            <p className="status-message">No artworks returned from the API.</p>
          )}

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default App;
