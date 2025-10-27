# ⚙️ Dynamic Filter System

A **full-stack web application** built for the *Nomination Task Challenge* to showcase backend efficiency, frontend responsiveness, and intelligent data handling.

This project demonstrates how to design a **Dynamic Filtering System** using **FastAPI**, **PostgreSQL**, **Redis**, and **Next.js (React)** — capable of handling **10,000+ records**, supporting **real-time dependent filters**, and offering a **fast, responsive UI**.

---

## 🚀 Features

### 🧠 Intelligent Filtering
- Supports filtering on **all 50+ columns**.
- **Dependent filter options**: When a user applies one filter (e.g., price range), all other filters update dynamically to reflect valid options.
- **Realistic data generation** with 10,000 records.

### ⚡ Performance Optimizations
- **PostgreSQL** for structured and indexed data.
- **Redis caching** to store and serve repeated queries efficiently.
- **Optimized query builder** for dynamic `WHERE` clauses.

### 🧩 Backend (FastAPI)
- RESTful APIs built with **FastAPI**.
- primary endpoints:
  1. `GET /data` → Returns filtered and paginated records.
  2. `GET /filters` → Returns dynamic filter options based on current filters.
- **Scalable structure** with clean modular code and dependency injection.

### 🎨 Frontend (Next.js + React)
- Responsive and interactive UI built with **Next.js** and **TailwindCSS**.
- **DataTable** with pagination, sorting, and search.
- **Dynamic filter panel** that updates intelligently.
- Smooth **loading and transition effects** with **Framer Motion**.

### 🧰 Tech Stack
| Layer | Technology |
|--------|-------------|
| Frontend | Next.js (React), TailwindCSS, Framer Motion |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Caching | Redis |

---

## 🗂️ Project Structure
```text
📦 Dynamic_filter_system
│
├── 📁 Backend
│   ├── 📁 app
│   │   ├── 📁 api
│   │   │   ├── 📁 routes
│   │   │   │   ├── data.py
│   │   │   │   └── filters.py
│   │   │   ├── __init__.py
│   │   │   └── router.py
│   │   ├── 📁 core
│   │   │   ├── config.py
│   │   │   └── constants.py
│   │   ├── 📁 db
│   │   │   └── connection.py
│   │   ├── 📁 middleware
│   │   │   └── cors.py
│   │   ├── 📁 utils
│   │   │   ├── __init__.py
│   │   │   ├── cache.py
│   │   │   ├── json_encoder.py
│   │   │   └── query_builder.py
│   │   └── main.py
│   └── requirements.txt
│
├── 📁 frontend
|   ├── 📁 types
|   │   ├── routes.d.ts
|   │   └── validator.ts
|   ├── 📁 components
|   │   ├── DataTable.js
|   │   └── FilterPanel.js
|   ├── 📁 public
|   │   ├── favicon.ico
|   │   ├── file.svg
|   │   ├── globe.svg
|   │   ├── next.svg
|   │   ├── vercel.svg
|   │   └── window.svg
|   ├── 📁 src
|   │   ├── 📁 pages
|   │   │   ├── 📁 api
|   │   │   │   └── Dynamic_filter_sys_API.js
|   │   │   ├── _app.js
|   │   │   ├── _document.js
|   │   │   └── index.js
|   │   └── 📁 styles
|   │       └── globals.css
|   |
|   ├── .env.local.example
|   ├── .gitignore
|   ├── jsconfig.json
|   ├── next.config.mjs
|   ├── package-lock.json
|   ├── package.json
|   ├── postcss.config.mjs
|   └── README.md
|
├── .env.example
├── .gitignore
└── README.md
```


---

#### ⚙️ Setup Instructions ####

### 🗄️ Backend Setup (FastAPI)

1. Clone the repository:
   ```bash
   git clone https://github.com/Jethva-Parthiv/Dynamic_Filter_System.git
   cd Dynamic_Filter_System/backend

2. Create a virtual environment and install dependencies:

    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt

3. Configure environment variables in a .env file:

    DATABASE_URL=postgresql://user:password@localhost:5432/filters_db
    REDIS_URL=redis://localhost:6379

### 🧩 Database & Data Generation

Before running the backend, set up your PostgreSQL database and populate it with 10,000 records.

1. Create Database
    psql -U youruser -d postgres;
    
   Once inside, create your project database:

    CREATE DATABASE your_DB;
    \q

2. Run Schema

    Navigate to the backend/Data_Generation folder and run the schema:

    cd backend/Data_Generation
    psql -U youruser -d yourdb -f schema.sql

3. Generate Data

    Update the credentials in data_gen.py:

    conn = psycopg2.connect(dbname='yourdb', user='youruser', password='yourpass',  host='localhost', port=5432)

    Then run:

    python data_gen.py

This will insert 10,000+ random car records into your database in batches of 1,000.



4. Run the FastAPI server:

    uvicorn app.main:app --reload


### ⚙️ Redis Connection Setup

Redis will be used for caching, rate limiting, or temporary filter results — boosting your API speed.

# Install Redis & Dependencies

If you don’t have it installed:

🪟 Windows (via WSL or Scoop)
    sudo apt update && sudo apt install redis-server
    sudo service redis-server start

    or

    scoop install redis
    redis-server

🐧 Linux / macOS
    sudo apt install redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server

# Verify Redis Connection

Run in terminal:
    redis-cli ping

Expected output:
    PONG    

# Configure environment variable for Redis in a .env file:

    REDIS_URL=redis://localhost:<port>
    # Example
        REDIS_URL=redis://localhost:6379


### 🧭 Frontend Setup (Next.js)

    1. Change to the frontend directory
    ```bash
    cd ../frontend
    ```

    2. Install dependencies
    ```bash
    npm install
    ```

    3. Create .env.local (example)
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

    4. Run the development server
    ```bash
    npm run dev
    ```

=============================================================================

### 📊 API Endpoints

#### 1️⃣ /data
- **Method:** GET  
- **Description:** Fetch filtered and paginated data.  
- **Query Parameters:**
    - `filters`: JSON string of filters
    - `limit`: Number of records per page
    - `offset`: Starting record index
- **Example:**
    ```
    GET /data?filters={"brand":"Toyota","fuel_type":"Petrol"}&limit=20&offset=0
    ```

#### 2️⃣ /filters
- **Method:** GET  
- **Description:** Fetch dynamic filter options based on currently applied filters.  
- **Example:**
    ```
    GET /filters?filters={"price_range":[10000,30000]}
    ```

#### 💾 Caching Logic (Redis)
- Each unique filter combination is hashed and stored in Redis.
- Repeated requests serve instantly from cache.
- Automatic cache invalidation when database updates occur.

### 🌐 Frontend Highlights
- Real-time filter updates using React hooks and memoization.
- Responsive DataTable with pagination and sorting.
- Smooth animations with Framer Motion.

### 🧠 Learning Outcomes
- Efficient query building and dynamic data handling.
- Full-stack integration between FastAPI and Next.js.
- Scalable architecture design with caching and pagination.
- Clean, modular, and production-ready codebase.

🏆 Project Showcase
- **Goal:** Demonstrate a real-world scalable filtering system for large datasets.
- **Keywords:** FastAPI · PostgreSQL · Redis · Next.js · Dynamic Filters · Pagination · Performance Optimization

👨‍💻 Author
- **Name:** Parthiv Jethva  
- **Role:** Computer Science Student · Backend & Full-Stack Developer - Python
- **GitHub Profile:** [Jethva-Parthiv](https://github.com/Jethva-Parthiv)
- **Contact:** [Email](mailto:jethvaparthiv07@gmail.com) 

### 📫 Get in Touch
- Feel free to reach out for collaborations or inquiries!
