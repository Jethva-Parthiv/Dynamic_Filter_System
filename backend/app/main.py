from fastapi import FastAPI
from app.db.connection import lifespan
from app.api.router import api_router
from app.middleware.cors import setup_cors

app = FastAPI(title="Dynamic Filter System API", lifespan=lifespan)
setup_cors(app)

app.include_router(api_router)
