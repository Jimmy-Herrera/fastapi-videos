from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Plataforma de Videos API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API activa y conectada a RDS"}

@app.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya esta registrado")
    new_user = models.User(name=user.name, email=user.email, password_hash=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or user.password_hash != user_credentials.password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"access_token": f"token_demo_{user.id}", "token_type": "bearer", "user_id": user.id}

@app.get("/users/{id}", response_model=schemas.UserResponse)
def get_user(id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@app.post("/videos", response_model=schemas.VideoResponse)
def create_video(video: schemas.VideoCreate, user_id: int, db: Session = Depends(database.get_db)):
    new_video = models.Video(**video.model_dump(), user_id=user_id)
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    return new_video

@app.get("/videos", response_model=List[schemas.VideoResponse])
def get_videos(db: Session = Depends(database.get_db)):
    return db.query(models.Video).all()

@app.get("/videos/{id}", response_model=schemas.VideoResponse)
def get_video(id: int, db: Session = Depends(database.get_db)):
    video = db.query(models.Video).filter(models.Video.id == id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")
    video.views += 1
    db.commit()
    return video

@app.delete("/videos/{id}")
def delete_video(id: int, db: Session = Depends(database.get_db)):
    video = db.query(models.Video).filter(models.Video.id == id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")
    db.delete(video)
    db.commit()
    return {"message": "Video eliminado correctamente"}

@app.post("/videos/{id}/comments", response_model=schemas.CommentResponse)
def add_comment(id: int, comment: schemas.CommentCreate, user_id: int, db: Session = Depends(database.get_db)):
    new_comment = models.Comment(content=comment.content, user_id=user_id, video_id=id)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@app.get("/videos/{id}/comments", response_model=List[schemas.CommentResponse])
def get_comments(id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Comment).filter(models.Comment.video_id == id).all()
