import axios from 'axios';
import { useState, useEffect } from 'react';

function App() {
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await axios.get('/api/artworks');
        setArtworks(response.data);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setError('Could not load artworks');
      }
    };

    fetchArtworks();
  }, []);

  return (
    <div>
      <h1>Art Catalogue</h1>
      {error && <p>{error}</p>}
      {artworks.map(a => (
        <div key={a._id || a.ObjectID}>
          <h2>{a.Title}</h2>
          <p>Artist: {Array.isArray(a.Artist) ? a.Artist.join(', ') : a.Artist}</p>
          <p>Date: {a.Date}</p>
          <p>Medium: {a.Medium}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
