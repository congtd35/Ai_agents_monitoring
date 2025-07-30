from sqlalchemy import Column, String, Text, DateTime, Integer, DECIMAL, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, column_property
import uuid
from ..core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    jira_task_link = Column(String(500))
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    agent_type = Column(String(50))
    agent_version = Column(String(20))
    status = Column(String(20), default="pending")
    priority = Column(String(10), default="medium")
    
    # Thời gian thực hiện
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    duration_seconds = Column(Integer)
    
    # Token usage
    input_tokens = Column(BigInteger, default=0)
    output_tokens = Column(BigInteger, default=0)
    total_tokens = column_property(input_tokens + output_tokens)
    
    # Chi phí
    cost_usd = Column(DECIMAL(10, 6), default=0)
    cost_breakdown = Column(JSONB, default={})
    
    # Số bước thực hiện
    total_steps = Column(Integer, default=0)
    completed_steps = Column(Integer, default=0)
    failed_steps = Column(Integer, default=0)
    
    # File operations
    files_created = Column(Integer, default=0)
    files_modified = Column(Integer, default=0)
    files_deleted = Column(Integer, default=0)
    total_files_affected = column_property(files_created + files_modified + files_deleted)
    
    # Metadata
    error_message = Column(Text)
    logs = Column(JSONB, default=[])
    performance_metrics = Column(JSONB, default={})
    environment_info = Column(JSONB, default={})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="tasks")
    file_operations = relationship("FileOperation", back_populates="task", cascade="all, delete-orphan")
    steps = relationship("TaskStep", back_populates="task", cascade="all, delete-orphan")

