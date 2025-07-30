from sqlalchemy import Column, String, Text, DateTime, Integer, DECIMAL, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base


class TaskStep(Base):
    __tablename__ = "task_steps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_name = Column(String(200))
    step_description = Column(Text)
    step_type = Column(String(50))  # 'analysis', 'code_generation', 'file_operation', 'api_call', etc.
    
    status = Column(String(20), default="pending")  # 'pending', 'running', 'completed', 'failed'
    
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    duration_seconds = Column(Integer)
    
    # Token usage cho step này
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    step_cost_usd = Column(DECIMAL(8, 6), default=0)
    
    # Kết quả
    result_data = Column(JSON, default={})
    error_message = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    task = relationship("Task", back_populates="steps")

    # Constraints
    __table_args__ = (
        UniqueConstraint('task_id', 'step_number', name='uq_task_step_number'),
    )

