import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import './App.css';

const emptyArtwork = {
  Title: '',
  Artist: '',
  Date: '',
  Medium: '',
  Classification: '',
  Department: '',
  ImageURL: '',
};

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

const sortOptions = [
  { value: '', label: 'Default order' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'date-desc', label: 'Date Newest' },
  { value: 'date-asc', label: 'Date Oldest' },
  { value: 'artist-asc', label: 'Artist A-Z' },
];

function App() {
  // Collection query state drives the backend API request.
  const [artworks, setArtworks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState('');
  const [sort, setSort] = useState('');

  // Form state is reused by both add and edit modal flows.
  const [formData, setFormData] = useState(emptyArtwork);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');

  // Fetch the current page from the backend whenever filters, sort, or page changes.
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/api/artworks', {
          params: {
            page: currentPage,
            limit: 20,
            search,
            classification,
            sort,
          },
        });

        setArtworks(Array.isArray(response.data.artworks) ? response.data.artworks : []);
        setCurrentPage(response.data.currentPage || currentPage);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setError('Could not load artworks');
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [currentPage, search, classification, sort]);

  // Reset modal state after successful submit, cancel, or close.
  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData(emptyArtwork);
    setFormError('');
  }, []);

  const closeForm = useCallback(() => {
    resetForm();
    setIsFormOpen(false);
  }, [resetForm]);

  // Let users close the modal with Escape as well as the close/cancel buttons.
  useEffect(() => {
    if (!isFormOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeForm();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, closeForm]);

  const formatArtist = (artist) => {
    if (Array.isArray(artist)) {
      return artist.filter(Boolean).join(', ');
    }

    return artist || 'Unknown artist';
  };

  // Keep form fields controlled so edit mode can populate existing artwork data.
  const updateFormField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const openAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const showPage = (page) => {
    setActivePage(page);
    if (page === 'collection') {
      setTimeout(() => {
        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Populate the modal with the selected artwork before switching into edit mode.
  const handleEdit = (artwork) => {
    setEditingId(artwork._id);
    setFormData({
      Title: artwork.Title || '',
      Artist: Array.isArray(artwork.Artist) ? artwork.Artist.join(', ') : artwork.Artist || '',
      Date: artwork.Date || '',
      Medium: artwork.Medium || '',
      Classification: artwork.Classification || '',
      Department: artwork.Department || '',
      ImageURL: artwork.ImageURL || '',
    });
    setIsFormOpen(true);
  };

  // Validate input locally, then send either a POST or PUT request to the API.
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setFormError('');
      const validationErrors = [];

      if (!formData.Title.trim()) validationErrors.push('Title is required');
      if (!formData.Artist.trim()) validationErrors.push('Artist is required');
      if (!formData.Date.trim()) validationErrors.push('Date is required');
      if (!formData.Medium.trim()) validationErrors.push('Medium is required');
      if (formData.ImageURL && !/^https?:\/\/.+/i.test(formData.ImageURL)) {
        validationErrors.push('Image URL must start with http:// or https://');
      }

      if (validationErrors.length > 0) {
        setFormError(validationErrors.join(', '));
        return;
      }

      const payload = {
        ...formData,
        Artist: formData.Artist
          .split(',')
          .map((artist) => artist.trim())
          .filter(Boolean),
      };

      if (editingId) {
        const response = await axios.put(`/api/artworks/${editingId}`, payload);
        setArtworks((current) =>
          current.map((artwork) => (artwork._id === editingId ? response.data : artwork)),
        );
      } else {
        const response = await axios.post('/api/artworks', payload);
        setArtworks((current) => [response.data, ...current]);
      }

      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.message || 'Could not save artwork');
    }
  };

  // Search only runs when the form is submitted, not on every key press.
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);

    // The browser search-field X clears the input without submitting the form.
    // When that happens, clear the active API search as well.
    if (value === '' && search) {
      setSearch('');
      setCurrentPage(1);
    }
  };

  // Delete uses a per-card loading state so repeated clicks cannot duplicate requests.
  const deleteArtwork = async (id) => {
    const confirmDelete = globalThis.confirm('Are you sure you want to delete this artwork?');
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await axios.delete(`/api/artworks/${id}`);
      setArtworks((current) => current.filter((artwork) => artwork._id !== id));
    } catch (error) {
      console.error('Error deleting artwork:', error);
      setError('Could not delete artwork');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="MoMA Art Catalogue home">
          <img src="/moma-logo.svg" alt="MoMA The Museum of Modern Art" />
        </a>
        <nav className="site-nav" aria-label="Primary navigation">
          <button
            className={activePage === 'home' ? 'active' : ''}
            type="button"
            onClick={() => showPage('home')}
          >
            Home
          </button>
          <button
            className={activePage === 'about' ? 'active' : ''}
            type="button"
            onClick={() => {
              window.location.href = 'http://localhost:5050/about';
            }}
          >
            About this page
          </button>
          <button
            className={activePage === 'collection' ? 'active' : ''}
            type="button"
            onClick={() => showPage('collection')}
          >
            Collection
          </button>
          <button className="add-nav-button" type="button" onClick={openAddForm}>
            + Add Artwork
          </button>
        </nav>
      </header>

      <main className="catalogue-shell" id="top">
        {activePage === 'about' ? (
          // About view explains the application and supports the assignment brief.
          <section className="about-page" aria-labelledby="about-title">
            <p className="eyebrow">About the catalogue</p>
            <h1 id="about-title">A local MoMA collection browser</h1>
            <p className="about-intro">
              This app is a full-stack catalogue for browsing artwork records from a local
              MongoDB database. It uses a React and Vite frontend with an Express API that
              handles searching, filtering, pagination, creation, editing, and deletion.
            </p>

            <div className="about-grid">
              <article>
                <h2>Collection Data</h2>
                <p>
                  Artwork records include core museum fields such as title, artist, date,
                  medium, classification, department, and image URL. The interface is designed
                  around fast scanning, with compact cards and consistent metadata.
                </p>
              </article>
              <article>
                <h2>Backend API</h2>
                <p>
                  The catalogue calls backend routes for paginated results, text search,
                  classification filtering, add, edit, and delete operations. Filtering is
                  done server-side so the frontend reflects the API results directly.
                </p>
              </article>
              <article>
                <h2>User Actions</h2>
                <p>
                  Users can search the collection, narrow results by classification, add new
                  artworks through a modal form, edit existing records, and remove records
                  with confirmation and loading feedback.
                </p>
              </article>
            </div>
          </section>
        ) : (
          <>
            {/* Hero and controls for the catalogue view. */}
            <section className="catalogue-hero" id="about">
              <div className="hero-content">
                <p className="eyebrow">Museum collection</p>
                <h1>MoMA Art Catalogue</h1>
                <p className="hero-copy">
                  Browse works from the collection loaded from the backend API.
                </p>
              </div>
              <div className="hero-visual" aria-hidden="true" />
            </section>

            <form className="search-bar" aria-label="Search and filter artworks" onSubmit={handleSearchSubmit}>
              <label className="search-field">
                <span>Search the collection</span>
                <input
                  type="search"
                  placeholder="Search by title, artist, medium..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                />
              </label>

              <button className="search-submit" type="submit">
                Search
              </button>

              <label className="classification-field">
                <span>Classification</span>
                <select
                  value={classification}
                  onChange={(event) => {
                    setClassification(event.target.value);
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

              <label className="sort-field">
                <span>Sort by</span>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {sortOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              {(searchInput || search || classification || sort) && (
                <button
                  className="clear-search"
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setClassification('');
                    setSort('');
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
              // Collection results are rendered from the backend response.
              <section id="collection">
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
                        <button className="edit-button" type="button" onClick={() => handleEdit(artwork)}>
                          Edit
                        </button>
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
                    onClick={() => setCurrentPage((previous) => Math.max(previous - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((previous) => Math.min(previous + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {isFormOpen && (
        <dialog className="modal-backdrop" open onCancel={closeForm} aria-modal="true" aria-labelledby="artwork-form-title">
          <section
            className="artwork-form-modal"
          >
            <div className="form-heading">
              <div>
                <p className="eyebrow">{editingId ? 'Edit record' : 'New record'}</p>
                <h2 id="artwork-form-title">{editingId ? 'Update Artwork' : 'Add Artwork'}</h2>
              </div>
              <button className="modal-close" type="button" onClick={closeForm} aria-label="Close form">
                ×
              </button>
            </div>

            <form className="artwork-form" onSubmit={handleSubmit}>
              {formError && <p className="form-error">{formError}</p>}
              <label>
                <span>Title</span>
                <input required value={formData.Title} onChange={(event) => updateFormField('Title', event.target.value)} />
              </label>
              <label>
                <span>Artist</span>
                <input required value={formData.Artist} onChange={(event) => updateFormField('Artist', event.target.value)} />
              </label>
              <label>
                <span>Date</span>
                <input required value={formData.Date} onChange={(event) => updateFormField('Date', event.target.value)} />
              </label>
              <label>
                <span>Medium</span>
                <input required value={formData.Medium} onChange={(event) => updateFormField('Medium', event.target.value)} />
              </label>
              <label>
                <span>Classification</span>
                <input value={formData.Classification} onChange={(event) => updateFormField('Classification', event.target.value)} />
              </label>
              <label>
                <span>Department</span>
                <input value={formData.Department} onChange={(event) => updateFormField('Department', event.target.value)} />
              </label>
              <label className="wide-field">
                <span>Image URL</span>
                <input type="url" value={formData.ImageURL} onChange={(event) => updateFormField('ImageURL', event.target.value)} />
              </label>

              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={closeForm}>
                  Cancel
                </button>
                <button className="form-submit" type="submit">
                  {editingId ? 'Save Changes' : '+ Add Artwork'}
                </button>
              </div>
            </form>
          </section>
        </dialog>
      )}
    </>
  );
}

export default App;
