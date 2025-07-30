from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
import uuid


class TaskBase(BaseModel):
    project_id: uuid.UUID
    name: str
    description: Optional[str] = None
    jira_task_link: Optional[str] = None
    session_id: str
    agent_type: Optional[str] = None
    agent_version: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: Decimal = Decimal('0')
    cost_breakdown: Dict[str, Any] = {}
    total_steps: int = 0
    completed_steps: int = 0
    failed_steps: int = 0
    files_created: int = 0
    files_modified: int = 0
    files_deleted: int = 0
    error_message: Optional[str] = None
    logs: List[Dict[str, Any]] = []
    performance_metrics: Dict[str, Any] = {}
    environment_info: Dict[str, Any] = {}


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    jira_task_link: Optional[str] = None
    agent_type: Optional[str] = None
    agent_version: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    cost_usd: Optional[Decimal] = None
    cost_breakdown: Optional[Dict[str, Any]] = None
    total_steps: Optional[int] = None
    completed_steps: Optional[int] = None
    failed_steps: Optional[int] = None
    files_created: Optional[int] = None
    files_modified: Optional[int] = None
    files_deleted: Optional[int] = None
    error_message: Optional[str] = None
    logs: Optional[List[Dict[str, Any]]] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    environment_info: Optional[Dict[str, Any]] = None


class TaskInDB(TaskBase):
    id: uuid.UUID
    total_tokens: int
    total_files_affected: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Task(TaskInDB):
    pass

