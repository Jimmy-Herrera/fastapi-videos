import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, fmtViews, timeAgo } from "../api.js";
import { useAuth } from "../auth.jsx";
import Avatar from "../components/Avatar.jsx";

const MAX_MB = 100;

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const own = user && String(user.id) === id;
  const [info, setInfo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [edit, setEdit] = useState(null);

  const load = () => {
    api.user(id).then(setInfo).catch((e) => setErr(e.message));
    api.videos(`?user_id=${id}`).then(setVideos).catch((e) => setErr(e.message));
  };
  useEffect(() => {
    setErr("");
    setOk("");
    load();
  }, [id]);

  async function publish(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const vid = fd.get("video");
    const thumb = fd.get("thumbnail");
    setOk("");
    if (!vid.name.toLowerCase().endsWith(".mp4") || vid.type !== "video/mp4") return setErr("El video debe ser un archivo MP4");
    if (vid.size > MAX_MB * 1024 * 1024) return setErr(`El video supera el máximo de ${MAX_MB} MB`);
    if (!/\.(jpe?g|png)$/i.test(thumb.name)) return setErr("La miniatura debe ser JPG, JPEG o PNG");
    setErr("");
    setProgress(0);
    setBusy(true);
    try {
      await api.createVideo(fd, setProgress);
      form.reset();
      setOk("Video publicado correctamente");
      load();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    try {
      await api.updateVideo(edit.id, { title: edit.title, description: edit.description });
      setEdit(null);
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  }

  async function remove(v) {
    if (!confirm(`¿Eliminar "${v.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteVideo(v.id);
      setOk("Video eliminado");
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  }

  if (!info) return err ? <p className="error">{err}</p> : <p className="muted">Cargando perfil...</p>;

  return (
    <>
      <section className="profile-head">
        <Avatar name={info.name} id={info.id} size={80} />
        <div>
          <h1>{info.name}</h1>
          <p className="muted">{info.email} · {info.videos_count} {info.videos_count === 1 ? "video" : "videos"}</p>
        </div>
      </section>

      {own && (
        <form className="upload" onSubmit={publish}>
          <h2>Subir video</h2>
          <label>Título<input name="title" required maxLength={200} /></label>
          <label>Descripción<textarea name="description" rows={3} /></label>
          <div className="two">
            <label>Video (MP4, máximo {MAX_MB} MB)<input name="video" type="file" accept="video/mp4" required /></label>
            <label>Miniatura (JPG o PNG)<input name="thumbnail" type="file" accept="image/jpeg,image/png" required /></label>
          </div>
          {busy && (
            <div className="bar" role="progressbar" aria-valuenow={progress}>
              <div style={{ width: `${progress}%` }} />
              <span>{progress < 100 ? `Subiendo ${progress}%` : "Procesando..."}</span>
            </div>
          )}
          <button className="pill" disabled={busy}>{busy ? "Subiendo..." : "Publicar"}</button>
        </form>
      )}

      {err && <p className="error">{err}</p>}
      {ok && <p className="success">{ok}</p>}

      <h2>{own ? "Mis videos" : "Videos"}</h2>
      {!videos.length && <p className="muted">Todavía no hay videos publicados.</p>}
      <ul className="mine">
        {videos.map((v) => (
          <li key={v.id}>
            <Link to={`/watch/${v.id}`} className="thumb"><img src={v.thumbnail_url} alt={v.title} /></Link>
            {edit?.id === v.id ? (
              <form onSubmit={saveEdit} className="grow edit">
                <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} required maxLength={200} />
                <textarea rows={3} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
                <div className="row">
                  <button className="pill">Guardar</button>
                  <button type="button" className="link" onClick={() => setEdit(null)}>Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="grow">
                <Link to={`/watch/${v.id}`} className="vtitle">{v.title}</Link>
                <p className="muted">{fmtViews(v.views)} · {timeAgo(v.created_at)}</p>
                <p className="mdesc">{v.description}</p>
                {own && (
                  <div className="row">
                    <button className="pill small" onClick={() => setEdit({ id: v.id, title: v.title, description: v.description })}>Editar</button>
                    <button className="pill small danger" onClick={() => remove(v)}>Eliminar</button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
