from sqlalchemy import Column, String, Text, DateTime, Integer, DECIMAL, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..core.database import Base


class AgentModel(Base):
    __tablename__ = "agent_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_name = Column(String(100), nullable=False)
    provider = Column(String(50), nullable=False)  # 'openai', 'anthropic', 'google', etc.
    model_version = Column(String(20))
    
    # Pricing
    input_price_per_1k_tokens = Column(DECIMAL(8, 6))
    output_price_per_1k_tokens = Column(DECIMAL(8, 6))
    
    # Capabilities
    max_tokens = Column(Integer)
    supports_function_calling = Column(Boolean, default=False)
    supports_vision = Column(Boolean, default=False)
    supports_code_execution = Column(Boolean, default=False)
    
    # Metadata
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Constraints
    __table_args__ = (
        UniqueConstraint('model_name', 'provider', 'model_version', name='uq_model_provider_version'),
    )

