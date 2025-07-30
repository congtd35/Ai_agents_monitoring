from sqlalchemy import Column, String, Text, DateTime, Date, Integer, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    jira_link = Column(String(500))
    repository_url = Column(String(500))
    status = Column(String(20), default="active")
    priority = Column(String(10), default="medium")
    owner_id = Column(UUID(as_uuid=True)) # Assuming owner_id is also a UUID
    team_members = Column(JSONB, default=[])  # Store as JSONB array
    start_date = Column(Date)
    end_date = Column(Date)
    budget = Column(DECIMAL(15, 2))
    estimated_hours = Column(Integer)
    actual_hours = Column(Integer)
    tags = Column(JSONB, default=[])  # Store as JSONB array
    project_metadata = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

