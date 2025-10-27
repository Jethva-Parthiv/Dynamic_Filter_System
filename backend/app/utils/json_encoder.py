import json
from decimal import Decimal
from datetime import date, datetime

class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return super().default(obj)

def json_dumps(data):
    return json.dumps(data, cls=EnhancedJSONEncoder)
