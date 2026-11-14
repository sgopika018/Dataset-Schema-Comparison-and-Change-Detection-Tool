import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function UploadCard({ title, file, onChange }) {
  return (
    <div className="card upload">
      <h3>{title}</h3>
      <label className="drop">
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={(e) => onChange(e.target.files[0] || null)}
        />
        <span>{file ? file.name : "Click to choose a CSV / Excel / JSON file"}</span>
      </label>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={`stat ${tone || ""}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function App() {
  const [oldFile, setOldFile] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCompare() {
    setError("");
    setResult(null);
    if (!oldFile || !newFile) {
      setError("Please choose both the old and the new file.");
      return;
    }
    const form = new FormData();
    form.append("old_file", oldFile);
    form.append("new_file", newFile);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/compare`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Comparison failed");
      setResult(data);
    } catch (e) {
      setError(
        e.message === "Failed to fetch"
          ? "Cannot reach the backend. Make sure it is running on http://127.0.0.1:8000"
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }

  const s = result?.summary;
  const riskTone = { None: "ok", Low: "ok", Medium: "warn", High: "bad" }[s?.risk_level];

  return (
    <div className="page">
      <header className="header">
        <h1>🛡️ SchemaGuard</h1>
        <p>Detect schema changes between two versions of a dataset</p>
      </header>

      <div className="grid2">
        <UploadCard title="Old file (version 1)" file={oldFile} onChange={setOldFile} />
        <UploadCard title="New file (version 2)" file={newFile} onChange={setNewFile} />
      </div>

      <div className="center">
        <button className="btn" onClick={handleCompare} disabled={loading}>
          {loading ? "Comparing..." : "Compare Schemas"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <>
          <div className="stats">
            <Stat label="Added columns" value={s.added} tone="ok" />
            <Stat label="Removed columns" value={s.removed} tone="bad" />
            <Stat label="Type changes" value={s.modified} tone="warn" />
            <Stat label="Possible renames" value={s.possible_renames} />
            <Stat label="Risk level" value={s.risk_level} tone={riskTone} />
          </div>

          <div className="card">
            <h3>Row counts</h3>
            <p>
              Old file: <b>{result.old_row_count}</b> rows &nbsp;|&nbsp; New file:{" "}
              <b>{result.new_row_count}</b> rows
            </p>
          </div>

          <div className="grid2">
            <div className="card">
              <h3>Added columns</h3>
              {result.added_columns.length ? (
                <ul>{result.added_columns.map((c) => <li key={c} className="tag ok">{c}</li>)}</ul>
              ) : <p className="muted">None</p>}
            </div>
            <div className="card">
              <h3>Removed columns</h3>
              {result.removed_columns.length ? (
                <ul>{result.removed_columns.map((c) => <li key={c} className="tag bad">{c}</li>)}</ul>
              ) : <p className="muted">None</p>}
            </div>
          </div>

          <div className="card">
            <h3>Data type changes</h3>
            {result.modified_columns.length ? (
              <table>
                <thead><tr><th>Column</th><th>Old type</th><th>New type</th></tr></thead>
                <tbody>
                  {result.modified_columns.map((m) => (
                    <tr key={m.column}><td>{m.column}</td><td>{m.old_type}</td><td>{m.new_type}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="muted">No data type changes</p>}
          </div>

          <div className="card">
            <h3>Rename suggestions</h3>
            {result.rename_suggestions.length ? (
              <table>
                <thead><tr><th>Old column</th><th>Possible new column</th><th>Similarity</th></tr></thead>
                <tbody>
                  {result.rename_suggestions.map((r, i) => (
                    <tr key={i}>
                      <td>{r.old_column}</td>
                      <td>{r.possible_new_column}</td>
                      <td>{r.similarity}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="muted">No likely renames found</p>}
          </div>

          <div className="grid2">
            <div className="card">
              <h3>Old schema</h3>
              <table>
                <thead><tr><th>Column</th><th>Type</th></tr></thead>
                <tbody>{Object.entries(result.old_schema).map(([c, t]) => <tr key={c}><td>{c}</td><td>{t}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="card">
              <h3>New schema</h3>
              <table>
                <thead><tr><th>Column</th><th>Type</th></tr></thead>
                <tbody>{Object.entries(result.new_schema).map(([c, t]) => <tr key={c}><td>{c}</td><td>{t}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
