import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile
from sqlalchemy.orm import Session, joinedload

from .. import storage
from ..auth import current_user
from ..config import settings
from ..database import get_db
from ..models import Comment, User, Video
from ..schemas import CommentCreate, CommentOut, VideoOut, VideoUpdate

router = APIRouter(tags=["Videos"])

ALLOWED_IMAGE_EXT = {"jpg", "jpeg", "png"}


def is_mp4(file: UploadFile) -> bool:
    file.file.seek(0)
    head = file.file.read(12)
    file.file.seek(0)
    return len(head) >= 12 and head[4:8] == b"ftyp"


def image_kind(file: UploadFile):
    file.file.seek(0)
    head = file.file.read(8)
    file.file.seek(0)
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head[:3] == b"\xff\xd8\xff":
        return "jpg"
    return None


def video_out(v: Video) -> VideoOut:
    return VideoOut(
        id=v.id, title=v.title, description=v.description or "", video_url=v.video_url,
        thumbnail_url=v.thumbnail_url, views=v.views, user_id=v.user_id,
        user_name=v.user.name, created_at=v.created_at,
    )


def comment_out(c: Comment) -> CommentOut:
    return CommentOut(
        id=c.id, content=c.content, user_id=c.user_id, user_name=c.user.name,
        video_id=c.video_id, created_at=c.created_at,
    )


def get_video_or_404(db: Session, video_id: int) -> Video:
    video = db.query(Video).options(joinedload(Video.user)).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")
    return video


@router.post("/videos", response_model=VideoOut, status_code=201)
def create_video(
    title: str = Form(..., min_length=1, max_length=200),
    description: str = Form(""),
    video: UploadFile = File(...),
    thumbnail: UploadFile = File(...),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    if not (video.filename or "").lower().endswith(".mp4") or video.content_type != "video/mp4" or not is_mp4(video):
        raise HTTPException(status_code=400, detail="El video debe ser un archivo MP4 válido")
    if storage.file_size(video) > settings.MAX_VIDEO_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"El video supera el máximo de {settings.MAX_VIDEO_MB} MB")

    ext = (thumbnail.filename or "").rsplit(".", 1)[-1].lower()
    kind = image_kind(thumbnail)
    if ext not in ALLOWED_IMAGE_EXT or kind is None:
        raise HTTPException(status_code=400, detail="La miniatura debe ser una imagen JPG, JPEG o PNG válida")

    video_url = storage.upload(video, settings.S3_VIDEOS_BUCKET, f"{uuid.uuid4()}.mp4", "video/mp4")
    try:
        thumb_url = storage.upload(
            thumbnail, settings.S3_THUMBNAILS_BUCKET, f"{uuid.uuid4()}.{kind}",
            "image/png" if kind == "png" else "image/jpeg",
        )
    except HTTPException:
        storage.delete(settings.S3_VIDEOS_BUCKET, video_url)
        raise

    new = Video(title=title.strip(), description=description, video_url=video_url,
                thumbnail_url=thumb_url, user_id=user.id)
    db.add(new)
    db.commit()
    return video_out(get_video_or_404(db, new.id))


@router.get("/videos", response_model=List[VideoOut])
def list_videos(
    user_id: Optional[int] = None,
    exclude: Optional[int] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Video).options(joinedload(Video.user))
    if user_id is not None:
        q = q.filter(Video.user_id == user_id)
    if exclude is not None:
        q = q.filter(Video.id != exclude)
    return [video_out(v) for v in q.order_by(Video.created_at.desc()).limit(limit).all()]


@router.get("/videos/{video_id}", response_model=VideoOut)
def get_video(video_id: int, db: Session = Depends(get_db)):
    get_video_or_404(db, video_id)
    db.query(Video).filter(Video.id == video_id).update({Video.views: Video.views + 1})
    db.commit()
    return video_out(get_video_or_404(db, video_id))


@router.put("/videos/{video_id}", response_model=VideoOut)
def update_video(video_id: int, data: VideoUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    video = get_video_or_404(db, video_id)
    if video.user_id != user.id:
        raise HTTPException(status_code=403, detail="Solo puedes editar tus videos")
    if data.title is not None:
        video.title = data.title.strip()
    if data.description is not None:
        video.description = data.description
    db.commit()
    return video_out(get_video_or_404(db, video_id))


@router.delete("/videos/{video_id}", status_code=204)
def delete_video(video_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    video = get_video_or_404(db, video_id)
    if video.user_id != user.id:
        raise HTTPException(status_code=403, detail="Solo puedes eliminar tus videos")
    storage.delete(settings.S3_VIDEOS_BUCKET, video.video_url)
    storage.delete(settings.S3_THUMBNAILS_BUCKET, video.thumbnail_url)
    db.delete(video)
    db.commit()
    return Response(status_code=204)


@router.post("/videos/{video_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(video_id: int, data: CommentCreate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    get_video_or_404(db, video_id)
    comment = Comment(content=data.content.strip(), user_id=user.id, video_id=video_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment_out(comment)


@router.get("/videos/{video_id}/comments", response_model=List[CommentOut])
def list_comments(video_id: int, db: Session = Depends(get_db)):
    get_video_or_404(db, video_id)
    rows = (db.query(Comment).options(joinedload(Comment.user))
            .filter(Comment.video_id == video_id).order_by(Comment.created_at.desc()).all())
    return [comment_out(c) for c in rows]
