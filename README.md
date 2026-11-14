# SchemaGuard

**Dataset schema comparison and change detection tool**

SchemaGuard is a full-stack web application that compares two versions of a dataset (CSV, Excel or JSON) and detects schema changes such as added, removed and modified columns. It uses a FastAPI backend with Pandas to analyze the files, suggests likely column renames using string similarity, and assigns a risk level based on breaking changes. A React dashboard presents the results as summary cards and tables, helping teams catch data structure changes before they break downstream reports and pipelines.

---

## Features

- Upload an old and a new file (`.csv`, `.xlsx`, `.xls`, `.json`)
- Detect added columns
- Detect removed columns
- Detect data type changes (for example `int64` to `float64`)
- Suggest possible column renames with a similarity score
- Show row counts for both files
- Assign a risk level: None, Low, Medium or High
- Interactive API documentation through Swagger

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Python, FastAPI, Uvicorn |
| Data processing | Pandas, openpyxl, xlrd |
| Rename matching | Python `difflib` (SequenceMatcher) |

## Project structure

```
SchemaGuard/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app and /compare endpoint
│   │   └── schema_engine.py   # Schema comparison logic
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Dashboard UI
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── sample_data/
│   ├── employees_v1.csv
│   └── employees_v2.csv
└── README.md
```

## Prerequisites

- Python 3.11 or newer
- Node.js (LTS)
- Visual Studio Code (recommended)

## Getting started

Open the project folder in VS Code and use two terminals.

### 1. Run the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at http://127.0.0.1:8000 and the Swagger docs are at http://127.0.0.1:8000/docs.

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser. Keep the backend running while you use the dashboard.

## Usage

1. Open http://localhost:5173.
2. Choose `sample_data/employees_v1.csv` as the old file.
3. Choose `sample_data/employees_v2.csv` as the new file.
4. Click **Compare Schemas**.

### Expected output for the sample files

| Result | Value |
|---|---|
| Added columns | `Department`, `Emp_ID`, `Monthly_Salary` |
| Removed columns | `Employee_ID`, `Salary` |
| Type changes | none |
| Rename suggestions | `Employee_ID` to `Emp_ID` (70.59%), `Salary` to `Monthly_Salary` (60%) |
| Risk level | Medium |

## API reference

### `GET /`

Health check.

```json
{ "message": "Welcome to SchemaGuard API", "status": "Running" }
```

### `POST /compare`

Compares two files. Send them as `multipart/form-data` with the fields `old_file` and `new_file`.

Example response:

```json
{
  "summary": {
    "added": 3,
    "removed": 2,
    "modified": 0,
    "possible_renames": 2,
    "risk_level": "Medium"
  },
  "old_schema": { "Employee_ID": "int64", "Name": "str", "Salary": "int64" },
  "new_schema": { "Emp_ID": "int64", "Name": "str", "Monthly_Salary": "int64", "Department": "str" },
  "added_columns": ["Department", "Emp_ID", "Monthly_Salary"],
  "removed_columns": ["Employee_ID", "Salary"],
  "modified_columns": [],
  "rename_suggestions": [
    { "old_column": "Employee_ID", "possible_new_column": "Emp_ID", "similarity": 70.59 },
    { "old_column": "Salary", "possible_new_column": "Monthly_Salary", "similarity": 60.0 }
  ],
  "old_row_count": 3,
  "new_row_count": 3
}
```

Unsupported file types return a `400` error with a message.

## How the risk level works

The risk level counts breaking changes, which are removed columns plus data type changes.

| Breaking changes | Added columns | Risk level |
|---|---|---|
| 0 | 0 | None |
| 0 | 1 or more | Low |
| 1 to 2 | any | Medium |
| 3 or more | any | High |

## Known limitations

- Only the schema is compared, not the values inside the data.
- Rename detection is based on name similarity, so it can miss renames such as `Stock` to `Quantity`.
- Comparison history is not saved yet.

## Roadmap

- PostgreSQL integration to store comparison history
- User authentication and accounts
- Data validation checks (null counts, duplicates)
- Impact analysis for downstream reports
- Automated tests and deployment

## Author

Gopika S
