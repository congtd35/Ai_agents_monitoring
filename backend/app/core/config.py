from pydantic_settings import BaseSettings
from typing import List, Optional, Union
import os


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./ai_agents.db"
    
    # Security
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # CORS
    cors_origins: Union[str, List[str]] = "http://localhost:3000,http://localhost:5173"
    
    # API
    api_v1_str: str = "/api/v1"
    project_name: str = "AI Agents Monitoring System"
    
    # Redis (optional)
    redis_url: Optional[str] = None
    
    def get_cors_origins(self) -> List[str]:
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",")]
        return self.cors_origins
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

