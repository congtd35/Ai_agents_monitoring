from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
import uuid


class TaskStepBase(BaseModel):
    task_id: uuid.UUID
    step_number: int
    step_name: Optional[str] = None
    step_description: Optional[str] = None
    step_type: Optional[str] = None
    status: str = "pending"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    input_tokens: int = 0
    output_tokens: int = 0
    step_cost_usd: Decimal = Decimal('0')
    result_data: Dict[str, Any] = {}
    error_message: Optional[str] = None


class TaskStepCreate(TaskStepBase):
    pass


class TaskStepUpdate(BaseModel):
    step_name: Optional[str] = None
    step_description: Optional[str] = None
    step_type: Optional[str] = None
    status: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    step_cost_usd: Optional[Decimal] = None
    result_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None


class TaskStepInDB(TaskStepBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskStep(TaskStepInDB):
    pass

