"use client";
import React, { useRef, useState } from "react";

type Entry = {
  picks: number;
  box: number;
};

export default function HomePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleUpload = async () => {
    const file = fileRef.current;
    if (!file) {
      setError("Please select a .DB0 file first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Upload failed");
      }

      const json = await res.json();
      console.log('Response from upload:', json.data);
      if (json.data) {
        setEntries(json.data);
      } else {
        throw new Error("No data received from API");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number, key: "picks" | "box", value: number) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      const res = await fetch("/api/save", {
        method: "POST",
        body: JSON.stringify(entries),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "VIP.DB0";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-4 rounded shadow mb-4">
        <div className="text-2xl font-bold text-purple-700 flex items-center gap-2">
          🧶 <span>Digital Weaving</span>
        </div>
        <div>
          <input
            type="file"
            accept=".DB0"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setFileName(file?.name || null);
              fileRef.current = file;
              setError(null);
            }}
            className="border rounded px-2 py-1"
          />
          <button
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
            } text-white px-4 py-1 rounded`}
            onClick={handleUpload}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {error && <p className="text-red-500 mt-1">{error}</p>}
      </header>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Editable Table View */}
        <div className="bg-white p-4 rounded shadow overflow-auto max-h-[80vh]">
          <h2 className="text-lg font-semibold mb-2">Editable Table</h2>
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">SR NO</th>
                <th className="border px-2 py-1">PICKS</th>
                <th className="border px-2 py-1">BOX NO</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={entry.picks}
                      className="w-full border px-1"
                      onChange={(e) =>
                        handleEdit(idx, "picks", parseInt(e.target.value))
                      }
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={entry.box}
                      className="w-full border px-1"
                      onChange={(e) =>
                        handleEdit(idx, "box", parseInt(e.target.value))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className={`mt-4 ${
              saving ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
            } text-white px-4 py-2 rounded`}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "💾 Save as .DB0"}
          </button>
          {saveError && <p className="text-red-500 mt-1">{saveError}</p>}
        </div>

        {/* Design Preview */}
        <div className="bg-black text-green-400 font-mono p-4 rounded shadow overflow-auto max-h-[80vh] text-sm">
          <h2 className="text-green-300 mb-2">[Design View Preview]</h2>
          <pre>
            {`SR NO. | PICKS | BOX NO.
-------------------------`}
            {entries.map(
              (entry, idx) =>
                `\n${String(idx + 1).padStart(6)} | ${String(
                  entry.picks
                ).padStart(5)} | ${String(entry.box).padStart(6)}`
            )}
          </pre>
        </div>

        
      </div>
    </div>
  );
}
