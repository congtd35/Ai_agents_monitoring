from sqlalchemy import Column, String, Text, DateTime, Integer, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base


class FileOperation(Base):
    __tablename__ = "file_operations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    operation_type = Column(String(10), nullable=False)  # 'create', 'modify', 'delete'
    file_path = Column(String(1000), nullable=False)
    file_name = Column(String(255))
    file_extension = Column(String(20))
    file_size_bytes = Column(BigInteger)
    
    # Chi tiết thay đổi
    lines_added = Column(Integer, default=0)
    lines_removed = Column(Integer, default=0)
    lines_modified = Column(Integer, default=0)
    
    # Nội dung thay đổi (cho file nhỏ)
    content_before = Column(Text)
    content_after = Column(Text)
    diff_content = Column(Text)
    
    # Metadata
    encoding = Column(String(20), default="utf-8")
    mime_type = Column(String(100))
    checksum_before = Column(String(64))
    checksum_after = Column(String(64))
    
    operation_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    step_number = Column(Integer)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    task = relationship("Task", back_populates="file_operations")

