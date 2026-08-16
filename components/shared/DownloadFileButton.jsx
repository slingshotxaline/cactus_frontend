// frontend/components/shared/DownloadFileButton.jsx
"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { downloadAuthFile } from "../../lib/downloadFile";

export default function DownloadFileButton({ path, children, className }) {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setError("");
    setIsLoading(true);
    try {
      await downloadAuthFile({
        path,
        accessToken,
        fallbackFilename: "download.pdf",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span>
      <button onClick={handleClick} disabled={isLoading} className={className}>
        {isLoading ? "Preparing..." : children}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </span>
  );
}
