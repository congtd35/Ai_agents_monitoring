from sqlalchemy import Column, String, Text, DateTime, Date, Integer, DECIMAL, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    jira_link = Column(String(500))
    repository_url = Column(String(500))
    status = Column(String(20), default="active")
    priority = Column(String(10), default="medium")
    owner_id = Column(String(36))
    team_members = Column(JSON, default="[]")  # Store as JSON array
    start_date = Column(Date)
    end_date = Column(Date)
    budget = Column(DECIMAL(15, 2))
    estimated_hours = Column(Integer)
    actual_hours = Column(Integer)
    tags = Column(JSON, default="[]")  # Store as JSON array
    project_metadata = Column(JSON, default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

