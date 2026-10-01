export default function PlayerPage() {
  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 2 }}>
        <video controls style={{ width: '100%' }}>
          <source src="" type="video/mp4" />
        </video>
        <h2>Titulo del Video</h2>
        <p>Descripcion del video aqui...</p>
        <hr />
        <h3>Comentarios</h3>
        <input type="text" placeholder="Escribe un comentario..." style={{ width: '80%' }} />
        <button>Comentar</button>
      </div>
      <div style={{ flex: 1 }}>
        <h3>Videos recomendados</h3>
      </div>
    </div>
  );
}
