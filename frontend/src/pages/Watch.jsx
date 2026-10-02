import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, fmtDate, fmtViews, timeAgo } from "../api.js";
import { useAuth } from "../auth.jsx";
import Avatar from "../components/Avatar.jsx";
import VideoCard from "../components/VideoCard.jsx";

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [rec, setRec] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setVideo(null);
    setErr("");
    window.scrollTo(0, 0);
    api.video(id).then(setVideo).catch((e) => setErr(e.message));
    api.comments(id).then(setComments).catch(() => {});
    api.videos(`?exclude=${id}&limit=8`).then(setRec).catch(() => {});
  }, [id]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const c = await api.addComment(id, text);
      setComments([c, ...comments]);
      setText("");
    } catch (ex) {
      setErr(ex.message);
    }
  }

  if (err && !video) return <p className="error">{err}</p>;
  if (!video) return <p className="muted">Cargando video...</p>;

  return (
    <div className="watch">
      <section>
        <video key={video.id} src={video.video_url} controls autoPlay className="player" />
        <h1 className="wtitle">{video.title}</h1>
        <div className="row owner">
          <Avatar name={video.user_name} id={video.user_id} size={40} />
          <Link to={`/profile/${video.user_id}`} className="vuser big">{video.user_name}</Link>
        </div>
        <div className="desc">
          <strong>{fmtViews(video.views)} · {fmtDate(video.created_at)}</strong>
          <p>{video.description || "Este video no tiene descripción."}</p>
        </div>

        <h2>{comments.length} {comments.length === 1 ? "comentario" : "comentarios"}</h2>
        {user ? (
          <form onSubmit={send} className="row comment-form">
            <Avatar name={user.name} id={user.id} />
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Agrega un comentario..." maxLength={1000} />
            <button className="pill" disabled={!text.trim()}>Comentar</button>
          </form>
        ) : (
          <p className="muted"><Link to="/auth">Inicia sesión</Link> para comentar.</p>
        )}
        {err && <p className="error">{err}</p>}
        <ul className="comments">
          {comments.map((c) => (
            <li key={c.id}>
              <Avatar name={c.user_name} id={c.user_id} />
              <div>
                <strong>{c.user_name}</strong> <span className="muted">{timeAgo(c.created_at)}</span>
                <p>{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside>
        <h2 className="rec-title">Videos recomendados</h2>
        {rec.length
          ? rec.map((v) => <VideoCard key={v.id} v={v} compact />)
          : <p className="muted">No hay más videos por ahora.</p>}
      </aside>
    </div>
  );
}
