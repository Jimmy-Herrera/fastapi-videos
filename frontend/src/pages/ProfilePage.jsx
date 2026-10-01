export default function ProfilePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Mi Perfil</h2>
      <p>Nombre: Estudiante</p>
      <p>Email: estudiante@uide.edu.ec</p>

      <h3>Subir nuevo video</h3>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Titulo" style={{ display: 'block', marginBottom: '10px' }} />
        <textarea placeholder="Descripcion" style={{ display: 'block', marginBottom: '10px' }}></textarea>
        <label>Archivo de video (.mp4):</label>
        <input type="file" accept="video/mp4" style={{ display: 'block', marginBottom: '10px' }} />
        <label>Miniatura (JPG/PNG):</label>
        <input type="file" accept="image/*" style={{ display: 'block', marginBottom: '10px' }} />
        <button type="submit">Publicar Video</button>
      </form>
    </div>
  );
}
