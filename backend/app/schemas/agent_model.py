from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
import uuid


class AgentModelBase(BaseModel):
    model_name: str
    provider: str
    model_version: Optional[str] = None
    input_price_per_1k_tokens: Optional[Decimal] = None
    output_price_per_1k_tokens: Optional[Decimal] = None
    max_tokens: Optional[int] = None
    supports_function_calling: bool = False
    supports_vision: bool = False
    supports_code_execution: bool = False
    description: Optional[str] = None
    is_active: bool = True


class AgentModelCreate(AgentModelBase):
    pass


class AgentModelUpdate(BaseModel):
    model_name: Optional[str] = None
    provider: Optional[str] = None
    model_version: Optional[str] = None
    input_price_per_1k_tokens: Optional[Decimal] = None
    output_price_per_1k_tokens: Optional[Decimal] = None
    max_tokens: Optional[int] = None
    supports_function_calling: Optional[bool] = None
    supports_vision: Optional[bool] = None
    supports_code_execution: Optional[bool] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class AgentModelInDB(AgentModelBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AgentModel(AgentModelInDB):
    pass

