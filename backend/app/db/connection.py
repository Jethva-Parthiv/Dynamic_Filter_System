from contextlib import asynccontextmanager
import asyncpg
import redis.asyncio as redis
from fastapi import FastAPI
from app.core.config import DATABASE_URL, REDIS_URL

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=20)
    app.state.redis = redis.from_url(REDIS_URL, decode_responses=True)
    print("✅ Database and Redis connections established")

    yield

    await app.state.pool.close()
    await app.state.redis.close()
    print("🧹 Database and Redis connections closed")
