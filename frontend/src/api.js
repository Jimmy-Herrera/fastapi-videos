const BASE = import.meta.env.VITE_API_URL;

function errorMessage(data, fallback) {
  if (typeof data?.detail === "string") return data.detail;
  return data?.detail?.[0]?.msg || fallback;
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }
  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {}
    throw new Error(errorMessage(data, "Ocurrió un error, intenta de nuevo"));
  }
  return res.status === 204 ? null : res.json();
}

// Se usa XMLHttpRequest para poder mostrar el porcentaje de subida del video
function uploadVideo(form, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/videos`);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(errorMessage(data, "No se pudo publicar el video")));
    };
    xhr.onerror = () => reject(new Error("No se pudo conectar con el servidor"));
    xhr.send(form);
  });
}

export const api = {
  register: (d) => request("/users", { method: "POST", body: d }),
  login: (d) => request("/login", { method: "POST", body: d }),
  user: (id) => request(`/users/${id}`),
  videos: (query = "") => request(`/videos${query}`),
  video: (id) => request(`/videos/${id}`),
  createVideo: uploadVideo,
  updateVideo: (id, body) => request(`/videos/${id}`, { method: "PUT", body }),
  deleteVideo: (id) => request(`/videos/${id}`, { method: "DELETE" }),
  comments: (id) => request(`/videos/${id}/comments`),
  addComment: (id, content) => request(`/videos/${id}/comments`, { method: "POST", body: { content } }),
};

// El servidor guarda la fecha en UTC; si llega sin zona horaria se la agregamos
const toDate = (d) => new Date(/Z|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`);

export const fmtDate = (d) =>
  toDate(d).toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "numeric" });

export function timeAgo(d) {
  const s = Math.max(0, Math.floor((Date.now() - toDate(d).getTime()) / 1000));
  const units = [
    [31536000, "año", "años"],
    [2592000, "mes", "meses"],
    [86400, "día", "días"],
    [3600, "hora", "horas"],
    [60, "minuto", "minutos"],
  ];
  for (const [sec, one, many] of units) {
    const n = Math.floor(s / sec);
    if (n >= 1) return `hace ${n} ${n === 1 ? one : many}`;
  }
  return "hace unos segundos";
}

export const fmtViews = (n) => `${n} ${n === 1 ? "visualización" : "visualizaciones"}`;
