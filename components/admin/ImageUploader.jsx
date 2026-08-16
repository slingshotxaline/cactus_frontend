"use client";

import { useRef, useState } from "react";
import { useUploadImageMutation } from "../../features/upload/uploadApi";

// Converts a picked file to base64 and uploads it via the backend's Cloudinary
// endpoint. Calls onUploaded({ url, publicId }) when done.
export default function ImageUploader({ onUploaded, folder = "products" }) {
  const inputRef = useRef(null);
  const [uploadImage, { isLoading }] = useUploadImageMutation();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const reader = new FileReader();
    reader.onload = async () => {
      setPreview(reader.result);
      try {
        const result = await uploadImage({ image: reader.result, folder }).unwrap();
        onUploaded(result.data);
      } catch (err) {
        setError(err?.data?.message || "Upload failed.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-300 overflow-hidden"
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400 text-center px-2">
            {isLoading ? "Uploading..." : "Click to upload"}
          </span>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
