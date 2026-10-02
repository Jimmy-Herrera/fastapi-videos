import { Link } from "react-router-dom";
import { fmtViews, timeAgo } from "../api.js";
import Avatar from "./Avatar.jsx";

export default function VideoCard({ v, compact = false }) {
  return (
    <div className={compact ? "vcard compact" : "vcard"}>
      <Link to={`/watch/${v.id}`} className="thumb">
        <img src={v.thumbnail_url} alt={v.title} loading="lazy" />
      </Link>
      <div className="vinfo">
        {!compact && <Avatar name={v.user_name} id={v.user_id} />}
        <div>
          <Link to={`/watch/${v.id}`} className="vtitle">{v.title}</Link>
          <Link to={`/profile/${v.user_id}`} className="vuser">{v.user_name}</Link>
          <p className="muted">{fmtViews(v.views)} · {timeAgo(v.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
