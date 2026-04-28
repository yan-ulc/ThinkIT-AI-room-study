"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";

type UploadButtonProps = {
  onClick?: () => void;
  onFiles?: (files: FileList) => void;
  isUploading?: boolean;
};

export function UploadButton({ onClick, onFiles, isUploading }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (onFiles) {
      onFiles(files);
      return;
    }
    onClick?.();
  };

  return (
    <button
      type="button"
      disabled={isUploading}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        if (isUploading) return;
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        if (isUploading) return;
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`group flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-[13px] font-medium transition-colors ${
        isUploading
          ? "border-muted bg-muted/50 text-text-4 cursor-not-allowed opacity-70"
          : isDragging
            ? "border-primary/70 bg-primary/10 text-primary"
            : "border-primary bg-transparent text-text-3 hover:border-primary/50 hover:bg-primary/4 hover:text-primary"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        disabled={isUploading}
        onChange={(event) => handleFiles(event.target.files)}
      />
      {isUploading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-text-4 border-t-transparent" />
          <span>Uploading...</span>
        </>
      ) : (
        <>
          <Upload size={13} className="transition-opacity group-hover:opacity-90" />
          <span>Upload Document</span>
          <span className="text-[11px] text-text-4">Drag file here to upload</span>
        </>
      )}
    </button>
  );
}
