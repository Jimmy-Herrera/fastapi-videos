import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import VideoCard from "../components/VideoCard.jsx";

export default function Home() {
  const [videos, setVideos] = useState(null);
  const [err, setErr] = useState("");
  const [params] = useSearchParams();
  const { user } = useAuth();
  const q = (params.get("q") || "").toLowerCase();

  useEffect(() => {
    api.videos().then(setVideos).catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="error">{err}</p>;
  if (!videos) return <p className="muted">Cargando videos...</p>;

  const shown = q
    ? videos.filter((v) => v.title.toLowerCase().includes(q) || v.user_name.toLowerCase().includes(q))
    : videos;

  if (!videos.length)
    return (
      <div className="empty">
        <h2>Todavía no hay videos</h2>
        <p className="muted">Sé el primero en publicar uno.</p>
        <Link to={user ? `/profile/${user.id}` : "/auth"} className="pill">
          {user ? "Subir video" : "Iniciar sesión"}
        </Link>
      </div>
    );

  return (
    <>
      {q && <p className="muted">Resultados para "{params.get("q")}": {shown.length}</p>}
      {!shown.length && <p className="muted">No se encontraron videos con ese texto.</p>}
      <div className="grid">
        {shown.map((v) => <VideoCard key={v.id} v={v} />)}
      </div>
    </>
  );
}
