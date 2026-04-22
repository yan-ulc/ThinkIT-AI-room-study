"use client";

import { Upload } from "lucide-react";

type UploadButtonProps = {
  onClick: () => void;
};

export function UploadButton({ onClick }: UploadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-transparent px-3 py-2.5 text-[12px] font-medium text-text-3 transition-all hover:border-primary/50 hover:bg-primary/4 hover:text-primary"
    >
      <Upload size={13} className="transition-transform group-hover:-translate-y-0.5" />
      Upload Document
    </button>
  );
}