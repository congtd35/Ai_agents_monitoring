from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class FileOperationBase(BaseModel):
    task_id: uuid.UUID
    operation_type: str  # 'create', 'modify', 'delete'
    file_path: str
    file_name: Optional[str] = None
    file_extension: Optional[str] = None
    file_size_bytes: Optional[int] = None
    lines_added: int = 0
    lines_removed: int = 0
    lines_modified: int = 0
    content_before: Optional[str] = None
    content_after: Optional[str] = None
    diff_content: Optional[str] = None
    encoding: str = "utf-8"
    mime_type: Optional[str] = None
    checksum_before: Optional[str] = None
    checksum_after: Optional[str] = None
    operation_timestamp: Optional[datetime] = None
    step_number: Optional[int] = None


class FileOperationCreate(FileOperationBase):
    pass


class FileOperationInDB(FileOperationBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class FileOperation(FileOperationInDB):
    pass

