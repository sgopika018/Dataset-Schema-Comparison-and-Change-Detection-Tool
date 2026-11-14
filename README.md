# SchemaGuard

React + FastAPI + Pandas schema comparison tool.

## Run (2 terminals in VS Code)

Terminal 1 - backend:
    cd backend
    python -m venv venv
    venv\Scripts\activate          (macOS/Linux: source venv/bin/activate)
    pip install -r requirements.txt
    uvicorn app.main:app --reload
  -> API docs: http://127.0.0.1:8000/docs

Terminal 2 - frontend:
    cd frontend
    npm install
    npm run dev
  -> Open http://localhost:5173

(On Windows you can also double-click run_backend.bat and run_frontend.bat.)

## See the output
1. Open http://localhost:5173
2. Old file: sample_data/employees_v1.csv
3. New file: sample_data/employees_v2.csv
4. Click "Compare Schemas"
