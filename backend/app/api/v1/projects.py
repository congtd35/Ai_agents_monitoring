from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from typing import List, Optional
from ...core.database import get_db
from ...models.project import Project
from ...models.task import Task
from ...schemas.project import Project as ProjectSchema, ProjectCreate, ProjectUpdate, ProjectStats, ProjectListResponse
from ...api.deps import get_current_user
from ...models.user import User

router = APIRouter()


@router.get("/", response_model=ProjectListResponse)
def read_projects(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in name, code, description"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all projects with pagination and filtering"""
    query = db.query(Project)
    
    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Project.name.ilike(search_filter)) |
            (Project.code.ilike(search_filter)) |
            (Project.description.ilike(search_filter))
        )
    
    if status:
        query = query.filter(Project.status == status)
        
    if priority:
        query = query.filter(Project.priority == priority)
    
    # Apply sorting
    sort_column = getattr(Project, sort_by, Project.created_at)
    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    skip = (page - 1) * page_size
    projects = query.offset(skip).limit(page_size).all()
    
    # Calculate pagination info
    total_pages = (total + page_size - 1) // page_size
    has_next = page < total_pages
    has_prev = page > 1
    
    return ProjectListResponse(
        items=projects,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev
    )


@router.post("/", response_model=ProjectSchema)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new project"""
    # Check if code already exists
    existing_project = db.query(Project).filter(Project.code == project.code).first()
    if existing_project:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project code already exists"
        )
    
    db_project = Project(**project.dict())
    if not db_project.owner_id:
        db_project.owner_id = current_user.id
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return db_project


@router.get("/{project_id}", response_model=ProjectSchema)
def read_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project by ID"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if new code conflicts with existing projects
    if project_update.code and project_update.code != project.code:
        existing_project = db.query(Project).filter(Project.code == project_update.code).first()
        if existing_project:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project code already exists"
            )
    
    update_data = project_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    return project


@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(project)
    db.commit()
    
    return {"message": "Project deleted successfully"}


@router.get("/{project_id}/stats", response_model=ProjectStats)
def get_project_stats(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project statistics"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get task statistics
    task_stats = db.query(
        func.count(Task.id).label('total_tasks'),
        func.sum(func.case([(Task.status == 'completed', 1)], else_=0)).label('completed_tasks'),
        func.sum(func.case([(Task.status == 'failed', 1)], else_=0)).label('failed_tasks'),
        func.sum(func.case([(Task.status == 'pending', 1)], else_=0)).label('pending_tasks'),
        func.sum(Task.cost_usd).label('total_cost'),
        func.sum(Task.input_tokens + Task.output_tokens).label('total_tokens'),
        func.sum(Task.files_created + Task.files_modified + Task.files_deleted).label('total_files_affected')
    ).filter(Task.project_id == project_id).first()
    
    return ProjectStats(
        total_tasks=task_stats.total_tasks or 0,
        completed_tasks=task_stats.completed_tasks or 0,
        failed_tasks=task_stats.failed_tasks or 0,
        pending_tasks=task_stats.pending_tasks or 0,
        total_cost=task_stats.total_cost or 0,
        total_tokens=task_stats.total_tokens or 0,
        total_files_affected=task_stats.total_files_affected or 0
    )

