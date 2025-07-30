from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
import uuid


class SystemMetricsBase(BaseModel):
    metric_date: date
    total_tasks_created: int = 0
    total_tasks_completed: int = 0
    total_tasks_failed: int = 0
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    total_cost_usd: Decimal = Decimal('0')
    avg_task_duration_seconds: Optional[int] = None
    avg_steps_per_task: Optional[Decimal] = None
    total_files_created: int = 0
    total_files_modified: int = 0
    total_files_deleted: int = 0


class SystemMetricsInDB(SystemMetricsBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class SystemMetrics(SystemMetricsInDB):
    pass

