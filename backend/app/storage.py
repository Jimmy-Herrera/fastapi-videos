import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, UploadFile

from .config import settings

# Sin credenciales en el código: boto3 usa el IAM Role de la instancia EC2
s3 = boto3.client("s3", region_name=settings.AWS_REGION)


def public_url(bucket: str, key: str) -> str:
    return f"https://{bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"


def upload(file: UploadFile, bucket: str, key: str, content_type: str) -> str:
    file.file.seek(0)
    try:
        s3.upload_fileobj(file.file, bucket, key, ExtraArgs={"ContentType": content_type})
    except (BotoCoreError, ClientError) as e:
        print(f"[S3] Error al subir a {bucket}: {e}")
        raise HTTPException(status_code=502, detail="No se pudo guardar el archivo en S3. Revisa el IAM Role y el nombre del bucket")
    return public_url(bucket, key)


def delete(bucket: str, url: str) -> None:
    try:
        s3.delete_object(Bucket=bucket, Key=url.rsplit("/", 1)[-1])
    except Exception:
        pass


def file_size(file: UploadFile) -> int:
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    return size
