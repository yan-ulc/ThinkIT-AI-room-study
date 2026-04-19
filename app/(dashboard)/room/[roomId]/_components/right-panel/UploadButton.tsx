"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

type UploadButtonProps = {
  onClick: () => void;
};

export function UploadButton({ onClick }: UploadButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="w-full text-xs gap-2 border-primary text-primary hover:bg-primary-muted"
    >
      <FileText size={14} /> Upload Document
    </Button>
  );
}
