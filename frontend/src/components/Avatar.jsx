const COLORS = ["#c2410c", "#0f766e", "#1d4ed8", "#7e22ce", "#be123c", "#4d7c0f", "#a16207"];

export default function Avatar({ name = "?", id = 0, size = 36 }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.45, background: COLORS[id % COLORS.length] }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
