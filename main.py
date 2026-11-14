import io
import json

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.schema_engine import compare_schemas

app = FastAPI(title="SchemaGuard API")

# Allow the React frontend (added in the next milestone) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_file(file):
    filename = file.filename.lower()

    if filename.endswith(".csv"):
        return pd.read_csv(io.BytesIO(file.content))
    elif filename.endswith((".xlsx", ".xls")):
        return pd.read_excel(io.BytesIO(file.content))
    elif filename.endswith(".json"):
        data = json.loads(file.content.decode("utf-8"))
        return pd.json_normalize(data)

    raise ValueError("Unsupported file format")


@app.get("/")
def home():
    return {"message": "Welcome to SchemaGuard API", "status": "Running"}


@app.post("/compare")
async def compare_files(
    old_file: UploadFile = File(...),
    new_file: UploadFile = File(...),
):
    allowed = (".csv", ".xlsx", ".xls", ".json")

    try:
        if not old_file.filename.lower().endswith(allowed):
            raise ValueError("Unsupported old file format")
        if not new_file.filename.lower().endswith(allowed):
            raise ValueError("Unsupported new file format")

        old_content = await old_file.read()
        new_content = await new_file.read()

        old_df = read_file(type("FileData", (), {"filename": old_file.filename, "content": old_content})())
        new_df = read_file(type("FileData", (), {"filename": new_file.filename, "content": new_content})())

        result = compare_schemas(old_df, new_df)
        result["old_row_count"] = len(old_df)
        result["new_row_count"] = len(new_df)
        return result

    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))
