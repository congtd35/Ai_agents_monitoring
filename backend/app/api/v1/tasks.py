from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid
from ...core.database import get_db
from ...models.task import Task
from ...models.file_operation import FileOperation
from ...models.task_step import TaskStep
from ...schemas.task import Task as TaskSchema, TaskCreate, TaskUpdate
from ...schemas.file_operation import FileOperation as FileOperationSchema
from ...schemas.task_step import TaskStep as TaskStepSchema
from ...api.deps import get_current_user
from ...models.user import User

router = APIRouter()


@router.get("/", response_model=List[TaskSchema])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[uuid.UUID] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tasks with filtering"""
    query = db.query(Task)
    
    if project_id:
        query = query.filter(Task.project_id == project_id)
    
    if status:
        query = query.filter(Task.status == status)
    
    if search:
        query = query.filter(
            (Task.name.contains(search)) |
            (Task.description.contains(search)) |
            (Task.session_id.contains(search))
        )
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks


@router.post("/", response_model=TaskSchema)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new task"""
    # Check if session_id already exists
    existing_task = db.query(Task).filter(Task.session_id == task.session_id).first()
    if existing_task:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID already exists"
        )
    
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task


@router.get("/{task_id}", response_model=TaskSchema)
def read_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task by ID"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.put("/{task_id}", response_model=TaskSchema)
def update_task(
    task_id: uuid.UUID,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}


@router.get("/{task_id}/steps", response_model=List[TaskStepSchema])
def get_task_steps(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all steps for a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    steps = db.query(TaskStep).filter(TaskStep.task_id == task_id).order_by(TaskStep.step_number).all()
    return steps


@router.get("/{task_id}/files", response_model=List[FileOperationSchema])
def get_task_files(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all file operations for a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    files = db.query(FileOperation).filter(FileOperation.task_id == task_id).order_by(FileOperation.operation_timestamp).all()
    return files


@router.get("/{task_id}/logs")
def get_task_logs(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task execution logs"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return {"logs": task.logs}

