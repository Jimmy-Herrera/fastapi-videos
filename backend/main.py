import os
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import s3_utils
from database import engine, Base

# Cargar variables de entorno
load_dotenv()

# Crear las tablas en la base de datos de RDS si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mosaiq API",
    description="Backend para la plataforma de videos Mosaiq",
    version="1.0.0"
)

# Configuración dinámica de CORS desde .env
origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in origins_env.split(",")] if origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Mosaiq API running smoothly"}

# Endpoint para subir imágenes o videos a AWS S3
@app.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_media(file: UploadFile = File(...)):
    if not (file.content_type.startswith("image/") or file.content_type.startswith("video/")):
        raise HTTPException(
            status_code=400, 
            detail="Tipo de archivo inválido. Solo se permiten imágenes o videos."
        )

    try:
        file_url = s3_utils.upload_file_to_s3(file.file, file.filename, file.content_type)
        return {
            "url": file_url,
            "filename": file.filename,
            "content_type": file.content_type
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para eliminar multimedia de S3
@app.delete("/media")
async def delete_media(file_url: str):
    try:
        s3_utils.delete_file_from_s3(file_url)
        return {"detail": "Archivo eliminado correctamente de S3"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))