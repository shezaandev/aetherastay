import React, { useState, useRef } from "react";
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { uploadToCloudinary } from "../../lib/cloudinary";

interface Props {
  currentUrl?: string;
  onUploadSuccess: (url: string) => void;
  label?: string;
  folder?: string;
  aspectHint?: string; // e.g. "16:9 recommended"
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function CloudinaryImageUpload({
  currentUrl,
  onUploadSuccess,
  label,
  folder = "aethera",
  aspectHint,
}: Props) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl || "");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file.");
      setStatus("error");
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setStatus("uploading");
    setErrorMsg("");

    try {
      const result = await uploadToCloudinary(file, folder);
      setPreviewUrl(result.secure_url);
      setStatus("success");
      onUploadSuccess(result.secure_url);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
      setPreviewUrl(currentUrl || "");
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-sans uppercase tracking-widest text-text-muted font-semibold">
          {label}
        </label>
      )}

      {/* Current image preview */}
      {previewUrl && (
        <div className="relative w-full rounded-lg overflow-hidden border border-terracotta/20 bg-[#1a1206]" style={{ maxHeight: 180 }}>
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-44 object-cover"
          />
          {status === "uploading" && (
            <div className="absolute inset-0 bg-bg-dark/70 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="absolute top-2 right-2 bg-green-700/80 rounded-full p-1">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Drop zone / upload button */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-terracotta bg-terracotta/10"
            : "border-terracotta/30 hover:border-terracotta/60 bg-[#1a1206]"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <Upload className="w-5 h-5 text-terracotta mx-auto mb-1" />
        <p className="text-xs text-text-muted font-sans">
          {status === "uploading"
            ? "Uploading to Cloudinary…"
            : "Click or drag & drop to upload"}
        </p>
        {aspectHint && (
          <p className="text-[10px] text-text-muted/60 mt-1 font-sans">{aspectHint}</p>
        )}
      </div>

      {/* Error message */}
      {status === "error" && errorMsg && (
        <div className="flex items-center gap-2 text-red-400 text-xs font-sans">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
