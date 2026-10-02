import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://18.118.49.114:8000";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Error backend fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Masapul a nakalogin-ka!");
      return;
    }

    if (!title || !videoFile || !thumbnailFile) {
      alert("Isukatmo amin a datos, video ken miniatura.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video_file', videoFile);
    formData.append('thumbnail_file', thumbnailFile);

    try {
      const response = await fetch(`${API_URL}/videos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Nai-publish a maipanggep ti video!");
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setThumbnailFile(null);
      } else {
        alert(`Error: ${data.detail || 'Ocurrió un error'}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error iti koneksion ti server.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Ag-load ti perfil...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Mi Perfil</h2>
      
      <p><strong>Nombre:</strong> {user ? user.username : 'Saan a nakalogin'}</p>
      <p><strong>Email:</strong> {user ? user.email : 'Saan a nakalogin'}</p>

      <h3>Subir nuevo video</h3>
      <form onSubmit={handleUpload}>
        <div>
          <input 
            type="text" 
            placeholder="Titulo" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <br />
        <div>
          <textarea 
            placeholder="Descripcion" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>
        <br />
        <div>
          <label>Archivo de video (.mp4):</label><br />
          <input 
            type="file" 
            accept="video/mp4" 
            onChange={(e) => setVideoFile(e.target.files[0])} 
            required 
          />
        </div>
        <br />
        <div>
          <label>Miniatura (JPG/PNG):</label><br />
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setThumbnailFile(e.target.files[0])} 
            required 
          />
        </div>
        <br />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Ag-upload ti video...' : 'Publicar Video'}
        </button>
      </form>
    </div>
  );
}