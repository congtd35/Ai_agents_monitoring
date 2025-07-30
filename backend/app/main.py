from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base
from .api.v1 import auth, projects, tasks, analytics

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    description="AI Agents Monitoring System API"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.api_v1_str}/auth", tags=["auth"])
app.include_router(projects.router, prefix=f"{settings.api_v1_str}/projects", tags=["projects"])
app.include_router(tasks.router, prefix=f"{settings.api_v1_str}/tasks", tags=["tasks"])
app.include_router(analytics.router, prefix=f"{settings.api_v1_str}/analytics", tags=["analytics"])


@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "AI Agents Monitoring System API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

