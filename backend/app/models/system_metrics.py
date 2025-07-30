from sqlalchemy import Column, String, Date, DateTime, Integer, BigInteger, DECIMAL, UniqueConstraint
from sqlalchemy.sql import func
import uuid
from ..core.database import Base


class SystemMetrics(Base):
    __tablename__ = "system_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_date = Column(Date, nullable=False)
    
    # Task metrics
    total_tasks_created = Column(Integer, default=0)
    total_tasks_completed = Column(Integer, default=0)
    total_tasks_failed = Column(Integer, default=0)
    
    # Token usage
    total_input_tokens = Column(BigInteger, default=0)
    total_output_tokens = Column(BigInteger, default=0)
    
    # Cost
    total_cost_usd = Column(DECIMAL(12, 6), default=0)
    
    # Performance
    avg_task_duration_seconds = Column(Integer)
    avg_steps_per_task = Column(DECIMAL(6, 2))
    
    # File operations
    total_files_created = Column(Integer, default=0)
    total_files_modified = Column(Integer, default=0)
    total_files_deleted = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Constraints
    __table_args__ = (
        UniqueConstraint('metric_date', name='uq_metric_date'),
    )

