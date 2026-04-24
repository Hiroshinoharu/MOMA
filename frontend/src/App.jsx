import axios from 'axios';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State for artworks, pagination, loading status, and error messages
  const [artworks, setArtworks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const classifications = [
    { value: '', label: 'All classifications' },
    { value: 'Architecture', label: 'Architecture' },
    { value: 'Design', label: 'Design' },
    { value: 'Drawing', label: 'Drawing' },
    { value: 'Illustrated Book', label: 'Illustrated Book' },
    { value: 'Painting', label: 'Painting' },
    { value: 'Photograph', label: 'Photograph' },
    { value: 'Print', label: 'Print' },
    { value: 'Sculpture', label: 'Sculpture' },
  ];

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setCurrentPage(1);
  };

  // Fetch artworks from the backend API when the component mounts or when currentPage or search changes
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/artworks', {
          params: {
            page: currentPage,
            limit: 20,
            search,
            classification,
          },
        });
        
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
  }, [currentPage, search, classification]);

  const formatArtist = (artist) => {
    if (Array.isArray(artist)) {
      return artist.filter(Boolean).join(', ');
    }

    return artist || 'Unknown artist';
  };

  const deleteArtwork = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this artwork?');
    if (!confirmDelete) return;

    try{
      setDeletingId(id);
      await axios.delete(`/api/artworks/${id}`);
      setArtworks((prevArtworks) => prevArtworks.filter((artwork) => artwork._id !== id));
    } catch (err) {
      console.error('Error deleting artwork:', err);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <main className="catalogue-shell">
      <section className="catalogue-hero">
        <div>
          <img className="moma-logo" src="/moma-logo.svg" alt="MoMA The Museum of Modern Art" />
          <p className="eyebrow">Museum collection</p>
          <h1>MoMA Art Catalogue</h1>
          <p className="hero-copy">
            Browse works from the collection loaded from the backend API.
          </p>
        </div>
      </section>

      <form className="search-bar" aria-label="Search and filter artworks" onSubmit={handleSearchSubmit}>
        <label className="search-field">
          <span>Search the collection</span>
          <input
            type="search"
            placeholder="Search by title, artist, medium..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>

        <button className="search-submit" type="submit">
          Search
        </button>

        <label className="classification-field">
          <span>Classification</span>
          <select
            value={classification}
            onChange={(e) => {
              setClassification(e.target.value);
              setCurrentPage(1);
            }}
          >
            {classifications.map((item) => (
              <option key={item.value || 'all'} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {(searchInput || search || classification) && (
          <button
            className="clear-search"
            type="button"
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setClassification('');
              setCurrentPage(1);
            }}
          >
            Clear filters
          </button>
        )}
      </form>

      {loading && <p className="status-message">Loading artworks...</p>}
      {error && <p className="status-message error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="results-bar">
            <p>
              <span>
                Showing <strong>{artworks.length}</strong> artworks
              </span>
              <span>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
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
                <div className="card-actions">
                  <button
                    className="delete-button"
                    type="button"
                    disabled={deletingId === artwork._id}
                    onClick={() => deleteArtwork(artwork._id)}
                  >
                    {deletingId === artwork._id ? 'Deleting...' : 'Delete'}
                  </button>
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
