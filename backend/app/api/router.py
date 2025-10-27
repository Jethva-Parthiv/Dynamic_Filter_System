from fastapi import APIRouter
from app.api.routes import data, filters

api_router = APIRouter()
api_router.include_router(data.router, tags=["Data"])
api_router.include_router(filters.router, tags=["Filters"])
