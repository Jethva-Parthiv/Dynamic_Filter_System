from typing import Dict, Any, Optional
from datetime import date, datetime
from app.core.constants import COLUMN_TYPES


def build_where(filters: Dict[str, Any], exclude_column: Optional[str] = None):
    clauses, params, idx = [], [], 1

    for col, val in (filters or {}).items():
        if exclude_column == col or col not in COLUMN_TYPES or val is None:
            continue

        ctype = COLUMN_TYPES[col]

        # --- Handle list filters ---
        if isinstance(val, list):
            # ✅ Numeric or integer range [min, max]
            if len(val) == 2 and all(isinstance(x, (int, float)) for x in val) and ctype in ("numeric", "integer"):
                clauses.append(f"{col} BETWEEN ${idx} AND ${idx + 1}")
                params += val
                idx += 2

            # ✅ Date range [start, end]
            elif len(val) == 2 and all(
                isinstance(x, (str, date, datetime)) for x in val
            ) and ctype == "date":
                # Convert to date objects if strings
                from datetime import date as d, datetime as dt
                parsed = []
                for x in val:
                    if isinstance(x, str):
                        parsed.append(dt.fromisoformat(x).date())
                    elif isinstance(x, dt):
                        parsed.append(x.date())
                    elif isinstance(x, d):
                        parsed.append(x)
                clauses.append(f"{col} BETWEEN ${idx} AND ${idx + 1}")
                params += parsed
                idx += 2

            # ✅ Multi-value IN clause (for text, category, boolean)
            else:
                placeholders = [f"${idx + i}" for i in range(len(val))]
                params += val
                idx += len(val)
                clauses.append(f"{col} IN ({', '.join(placeholders)})")

        # --- Handle single-value filters ---
        else:
            clauses.append(f"{col} = ${idx}")
            params.append(val)
            idx += 1

    where_sql = f" WHERE {' AND '.join(clauses)}" if clauses else ""
    return where_sql, params
