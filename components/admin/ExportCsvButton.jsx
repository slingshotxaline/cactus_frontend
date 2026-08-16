// frontend/components/admin/ExportCsvButton.jsx
"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { downloadAuthFile } from "../../lib/downloadFile";

export default function ExportCsvButton({ path, label = "Export CSV" }) {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setError("");
    try {
      await downloadAuthFile({ path, accessToken, fallbackFilename: "export.csv" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium"
      >
        {label}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}