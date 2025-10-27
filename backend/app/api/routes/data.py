import json
from datetime import datetime, date
from fastapi import APIRouter, Query, HTTPException, Request
from app.utils.query_builder import build_where
from app.utils.cache import make_cache_key
from app.utils.json_encoder import json_dumps
from app.core.constants import COLUMN_TYPES
from app.core.config import TABLE

router = APIRouter()


# --- Helper to safely convert date strings ---
def parse_date(value):
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            # Match standard date format: "YYYY-MM-DD"
            return datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            return value
    return value


@router.get("/data")
async def get_data(
    request: Request,
    filters: str = Query("{}", description="JSON encoded filters"), 
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    order_by: str = Query("id"),
    order_dir: str = Query("asc")
):
    # --- Parse filters safely ---
    try:
        fdict = json.loads(filters)
        if not isinstance(fdict, dict):
            raise ValueError
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid filters JSON format")

    # --- Validate ordering ---
    if order_by not in COLUMN_TYPES and order_by != "id":
        order_by = "id"
    order_dir = "DESC" if order_dir.lower() == "desc" else "ASC"

    # --- Cache key setup ---
    redis_client = request.app.state.redis
    cache_key = make_cache_key("data", {
        "filters": fdict,
        "limit": limit,
        "offset": offset,
        "order_by": order_by,
        "order_dir": order_dir,
    })

    if cached := await redis_client.get(cache_key):
        return json.loads(cached)

    # --- Build SQL WHERE + parameters ---
    where_sql, params = build_where(fdict)

    # ✅ Convert any date strings to real date objects
    params = [parse_date(p) for p in params]

    sql = f"""
        SELECT * FROM {TABLE}
        {where_sql}
        ORDER BY {order_by} {order_dir}
        LIMIT ${len(params)+1}
        OFFSET ${len(params)+2}
    """
    params += [limit, offset]

    # --- Fetch data ---
    async with request.app.state.pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)
        data = {
            "rows": [dict(r) for r in rows],
            "count": len(rows),
            "limit": limit,
            "offset": offset,
        }

    # --- Cache for 60 seconds ---
    await redis_client.setex(cache_key, 60, json_dumps(data))
    return data


@router.get("/data/count")
async def get_data_count(
    request: Request,
    filters: str = Query("{}", description="JSON encoded filters")
):
    try:
        fdict = json.loads(filters)
        if not isinstance(fdict, dict):
            raise ValueError
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid filters JSON format")

    redis_client = request.app.state.redis
    cache_key = make_cache_key("data_count", {"filters": fdict})

    if cached := await redis_client.get(cache_key):
        return {"count": int(cached)}

    where_sql, params = build_where(fdict)

    # ✅ Convert date strings to date objects
    params = [parse_date(p) for p in params]

    sql = f"SELECT COUNT(*) AS count FROM {TABLE} {where_sql}"
    async with request.app.state.pool.acquire() as conn:
        row = await conn.fetchrow(sql, *params)
        count = row["count"] if row else 0

    await redis_client.setex(cache_key, 60, str(count))
    return {"count": count}
