from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta, date
from ...core.database import get_db
from ...models.task import Task
from ...models.project import Project
from ...models.system_metrics import SystemMetrics
from ...api.deps import get_current_user
from ...models.user import User

router = APIRouter()


@router.get("/dashboard")
def get_dashboard_stats(
    days: int = Query(30, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Task statistics
    total_tasks = db.query(func.count(Task.id)).scalar()
    
    recent_tasks = db.query(func.count(Task.id)).filter(
        Task.created_at >= start_date
    ).scalar()
    
    completed_tasks = db.query(func.count(Task.id)).filter(
        Task.status == 'completed',
        Task.created_at >= start_date
    ).scalar()
    
    failed_tasks = db.query(func.count(Task.id)).filter(
        Task.status == 'failed',
        Task.created_at >= start_date
    ).scalar()
    
    # Cost and token statistics
    cost_stats = db.query(
        func.sum(Task.cost_usd).label('total_cost'),
        func.sum(Task.input_tokens).label('total_input_tokens'),
        func.sum(Task.output_tokens).label('total_output_tokens')
    ).filter(Task.created_at >= start_date).first()
    
    # File operations statistics
    file_stats = db.query(
        func.sum(Task.files_created).label('total_files_created'),
        func.sum(Task.files_modified).label('total_files_modified'),
        func.sum(Task.files_deleted).label('total_files_deleted')
    ).filter(Task.created_at >= start_date).first()
    
    # Project statistics
    total_projects = db.query(func.count(Project.id)).scalar()
    active_projects = db.query(func.count(Project.id)).filter(
        Project.status == 'active'
    ).scalar()
    
    return {
        "tasks": {
            "total": total_tasks,
            "recent": recent_tasks,
            "completed": completed_tasks,
            "failed": failed_tasks,
            "success_rate": (completed_tasks / recent_tasks * 100) if recent_tasks > 0 else 0
        },
        "costs": {
            "total_cost": float(cost_stats.total_cost or 0),
            "total_input_tokens": cost_stats.total_input_tokens or 0,
            "total_output_tokens": cost_stats.total_output_tokens or 0,
            "total_tokens": (cost_stats.total_input_tokens or 0) + (cost_stats.total_output_tokens or 0)
        },
        "files": {
            "created": file_stats.total_files_created or 0,
            "modified": file_stats.total_files_modified or 0,
            "deleted": file_stats.total_files_deleted or 0,
            "total": (file_stats.total_files_created or 0) + (file_stats.total_files_modified or 0) + (file_stats.total_files_deleted or 0)
        },
        "projects": {
            "total": total_projects,
            "active": active_projects
        }
    }


@router.get("/tasks/performance")
def get_task_performance(
    days: int = Query(30, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task performance metrics"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Daily task completion
    daily_stats = db.query(
        func.date(Task.created_at).label('date'),
        func.count(Task.id).label('total_tasks'),
        func.sum(func.case([(Task.status == 'completed', 1)], else_=0)).label('completed_tasks'),
        func.sum(func.case([(Task.status == 'failed', 1)], else_=0)).label('failed_tasks'),
        func.avg(Task.duration_seconds).label('avg_duration')
    ).filter(
        Task.created_at >= start_date
    ).group_by(func.date(Task.created_at)).order_by(func.date(Task.created_at)).all()
    
    # Average metrics
    avg_metrics = db.query(
        func.avg(Task.duration_seconds).label('avg_duration'),
        func.avg(Task.total_steps).label('avg_steps'),
        func.avg(Task.cost_usd).label('avg_cost'),
        func.avg(Task.input_tokens + Task.output_tokens).label('avg_tokens')
    ).filter(
        Task.created_at >= start_date,
        Task.status == 'completed'
    ).first()
    
    return {
        "daily_stats": [
            {
                "date": str(stat.date),
                "total_tasks": stat.total_tasks,
                "completed_tasks": stat.completed_tasks,
                "failed_tasks": stat.failed_tasks,
                "avg_duration": float(stat.avg_duration or 0)
            }
            for stat in daily_stats
        ],
        "averages": {
            "duration_seconds": float(avg_metrics.avg_duration or 0),
            "steps": float(avg_metrics.avg_steps or 0),
            "cost_usd": float(avg_metrics.avg_cost or 0),
            "tokens": float(avg_metrics.avg_tokens or 0)
        }
    }


@router.get("/costs")
def get_cost_analysis(
    days: int = Query(30, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get cost analysis"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Daily cost breakdown
    daily_costs = db.query(
        func.date(Task.created_at).label('date'),
        func.sum(Task.cost_usd).label('total_cost'),
        func.sum(Task.input_tokens).label('input_tokens'),
        func.sum(Task.output_tokens).label('output_tokens')
    ).filter(
        Task.created_at >= start_date
    ).group_by(func.date(Task.created_at)).order_by(func.date(Task.created_at)).all()
    
    # Cost by project
    project_costs = db.query(
        Project.name.label('project_name'),
        func.sum(Task.cost_usd).label('total_cost'),
        func.count(Task.id).label('task_count')
    ).join(Task).filter(
        Task.created_at >= start_date
    ).group_by(Project.id, Project.name).order_by(desc(func.sum(Task.cost_usd))).limit(10).all()
    
    return {
        "daily_costs": [
            {
                "date": str(cost.date),
                "total_cost": float(cost.total_cost or 0),
                "input_tokens": cost.input_tokens or 0,
                "output_tokens": cost.output_tokens or 0
            }
            for cost in daily_costs
        ],
        "project_costs": [
            {
                "project_name": cost.project_name,
                "total_cost": float(cost.total_cost or 0),
                "task_count": cost.task_count
            }
            for cost in project_costs
        ]
    }


@router.get("/usage-trends")
def get_usage_trends(
    days: int = Query(90, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get usage trends"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Weekly trends
    weekly_trends = db.query(
        func.date_trunc('week', Task.created_at).label('week'),
        func.count(Task.id).label('task_count'),
        func.sum(Task.cost_usd).label('total_cost'),
        func.sum(Task.input_tokens + Task.output_tokens).label('total_tokens'),
        func.avg(Task.duration_seconds).label('avg_duration')
    ).filter(
        Task.created_at >= start_date
    ).group_by(func.date_trunc('week', Task.created_at)).order_by(func.date_trunc('week', Task.created_at)).all()
    
    # Most active projects
    active_projects = db.query(
        Project.name.label('project_name'),
        func.count(Task.id).label('task_count'),
        func.max(Task.created_at).label('last_activity')
    ).join(Task).filter(
        Task.created_at >= start_date
    ).group_by(Project.id, Project.name).order_by(desc(func.count(Task.id))).limit(10).all()
    
    return {
        "weekly_trends": [
            {
                "week": trend.week.isoformat() if trend.week else None,
                "task_count": trend.task_count,
                "total_cost": float(trend.total_cost or 0),
                "total_tokens": trend.total_tokens or 0,
                "avg_duration": float(trend.avg_duration or 0)
            }
            for trend in weekly_trends
        ],
        "active_projects": [
            {
                "project_name": project.project_name,
                "task_count": project.task_count,
                "last_activity": project.last_activity.isoformat() if project.last_activity else None
            }
            for project in active_projects
        ]
    }

