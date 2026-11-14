from difflib import SequenceMatcher


def get_schema(df):
    """Return {column_name: data_type_as_string} for a DataFrame."""
    return {str(col): str(dtype) for col, dtype in df.dtypes.items()}


def compare_schemas(old_df, new_df):
    old_schema = get_schema(old_df)
    new_schema = get_schema(new_df)

    old_columns = set(old_schema.keys())
    new_columns = set(new_schema.keys())

    added = sorted(new_columns - old_columns)
    removed = sorted(old_columns - new_columns)

    modified = []
    for column in sorted(old_columns & new_columns):
        if old_schema[column] != new_schema[column]:
            modified.append({
                "column": column,
                "old_type": old_schema[column],
                "new_type": new_schema[column],
            })

    rename_suggestions = []
    for old_col in removed:
        for new_col in added:
            similarity = SequenceMatcher(None, old_col.lower(), new_col.lower()).ratio()
            if similarity >= 0.5:
                rename_suggestions.append({
                    "old_column": old_col,
                    "possible_new_column": new_col,
                    "similarity": round(similarity * 100, 2),
                })

    breaking = len(removed) + len(modified)
    if breaking == 0 and not added:
        risk = "None"
    elif breaking == 0:
        risk = "Low"
    elif breaking <= 2:
        risk = "Medium"
    else:
        risk = "High"

    return {
        "summary": {
            "added": len(added),
            "removed": len(removed),
            "modified": len(modified),
            "possible_renames": len(rename_suggestions),
            "risk_level": risk,
        },
        "old_schema": old_schema,
        "new_schema": new_schema,
        "added_columns": added,
        "removed_columns": removed,
        "modified_columns": modified,
        "rename_suggestions": rename_suggestions,
    }
