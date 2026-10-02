export default function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Plataforma de Videos</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
          <img src="https://via.placeholder.com/250x140" alt="Miniatura" style={{ width: '100%' }} />
          <h3>Titulo del Video</h3>
          <p>Publicado por: Usuario</p>
          <small>100 vistas</small>
        </div>
      </div>
    </div>
  );
}
