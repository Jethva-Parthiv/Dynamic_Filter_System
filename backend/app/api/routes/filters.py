import json
import asyncio
import datetime
from fastapi import APIRouter, Query, HTTPException, Request
from app.utils.query_builder import build_where
from app.utils.cache import make_cache_key
from app.utils.json_encoder import json_dumps
from app.core.constants import COLUMN_TYPES
from app.core.config import TABLE

router = APIRouter()

def convert_date_values(filters: dict) -> dict:
    """Convert string date values (YYYY-MM-DD) to datetime.date objects."""
    converted = {}
    for k, v in filters.items():
        if isinstance(v, list):
            new_list = []
            for item in v:
                if isinstance(item, str):
                    try:
                        new_list.append(datetime.date.fromisoformat(item))
                    except ValueError:
                        new_list.append(item)
                else:
                    new_list.append(item)
            converted[k] = new_list
        else:
            if isinstance(v, str):
                try:
                    converted[k] = datetime.date.fromisoformat(v)
                except ValueError:
                    converted[k] = v
            else:
                converted[k] = v
    return converted


@router.get("/filters")
async def get_filters(
    request: Request,
    filters: str = Query("{}", description="JSON encoded filters")
):
    # --- Parse filters safely ---
    try:
        fdict = json.loads(filters)
        if not isinstance(fdict, dict):
            raise ValueError
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid filters JSON format")

    # --- Convert any date strings into datetime.date objects ---
    fdict = convert_date_values(fdict)

    redis_client = request.app.state.redis
    cache_key = make_cache_key("filters", fdict)

    # --- Serve cached data if available ---
    if cached := await redis_client.get(cache_key):
        return json.loads(cached)

    pool = request.app.state.pool

    async def fetch_filter(col: str, ctype: str):
        """Fetch available options or min/max for each filter column."""
        where_sql, params = build_where(fdict, exclude_column=col)
        async with pool.acquire() as conn:
            if ctype in ("categorical", "text", "boolean"):
                q = f"""
                    SELECT DISTINCT {col}
                    FROM {TABLE}
                    {where_sql}
                    ORDER BY {col} NULLS LAST
                    LIMIT 200
                """
                rows = await conn.fetch(q, *params)
                return col, {
                    "type": ctype,
                    "options": [r[col] for r in rows if r[col] is not None]
                }

            elif ctype in ("integer", "numeric", "date"):
                q = f"""
                    SELECT MIN({col}) AS min, MAX({col}) AS max
                    FROM {TABLE}
                    {where_sql}
                """
                row = await conn.fetchrow(q, *params)
                min_val, max_val = row["min"], row["max"]

                # Format dates for JSON response
                if ctype == "date":
                    if isinstance(min_val, (datetime.date, datetime.datetime)):
                        min_val = min_val.isoformat()
                    if isinstance(max_val, (datetime.date, datetime.datetime)):
                        max_val = max_val.isoformat()

                return col, {"type": ctype, "min": min_val, "max": max_val}

            # Fallback for unknown types
            return col, {"type": ctype, "options": []}

    # --- Run all queries concurrently (10 at a time for efficiency) ---
    semaphore = asyncio.Semaphore(10)

    async def limited_fetch(col, ctype):
        async with semaphore:
            return await fetch_filter(col, ctype)

    results_list = await asyncio.gather(
        *[limited_fetch(col, ctype) for col, ctype in COLUMN_TYPES.items()]
    )

    result = {"filters": dict(results_list)}

    # --- Cache the result for 120 seconds ---
    await redis_client.setex(cache_key, 120, json_dumps(result))
    return result
