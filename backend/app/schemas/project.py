from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal


class ProjectBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    jira_link: Optional[str] = None
    repository_url: Optional[str] = None
    status: str = "active"
    priority: str = "medium"
    owner_id: Optional[str] = None
    team_members: List[str] = []
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[Decimal] = None
    estimated_hours: Optional[int] = None
    actual_hours: Optional[int] = None
    tags: List[str] = []
    project_metadata: Dict[str, Any] = {}


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    jira_link: Optional[str] = None
    repository_url: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    owner_id: Optional[str] = None
    team_members: Optional[List[str]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[Decimal] = None
    estimated_hours: Optional[int] = None
    actual_hours: Optional[int] = None
    tags: Optional[List[str]] = None
    project_metadata: Optional[Dict[str, Any]] = None


class ProjectInDB(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Project(ProjectInDB):
    pass


class ProjectStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    failed_tasks: int
    pending_tasks: int
    total_cost: Decimal
    total_tokens: int
    total_files_affected: int


class ProjectListResponse(BaseModel):
    items: List[Project]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

