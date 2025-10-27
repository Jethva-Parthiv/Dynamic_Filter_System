from dotenv import load_dotenv
import os

load_dotenv()

# if DATABASE_URL and REDIS_URL are not set in environment variables,
# use default values and replace with your actual defaults
# in place of Default_Database_URL_Here and Default_Redis_URL_Here

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://username:password@localhost:port/DATABASE_Name" #Default_Database_URL_Here
    )

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://localhost:port" #Default_Redis_URL_Here
    )

# Give a TABLE name as In your database
TABLE = "cars"
